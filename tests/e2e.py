"""Prueba de extremo a extremo en Chromium (móvil): python3 tests/e2e.py
Requiere: pip install playwright && python -m playwright install chromium
Levanta un servidor local, juega la cita completa, recarga, prueba sin conexión y desempate.
"""
import os, sys, threading, http.server, socketserver, functools, tempfile, json
from playwright.sync_api import sync_playwright, expect

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get('PORT', '8765'))
SHOTS = os.environ.get('SHOTS', os.path.join(tempfile.gettempdir(), 'cita-shots'))
os.makedirs(SHOTS, exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

def serve():
    handler = functools.partial(Quiet, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd

def make_photo(path, color):
    from PIL import Image, ImageDraw
    im = Image.new('RGB', (900, 1200), color)
    d = ImageDraw.Draw(im)
    d.ellipse((250, 300, 650, 700), fill=(255, 240, 230))
    im.save(path, quality=90)

results = []
def check(name, cond):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name)

def shot(page, name):
    page.screenshot(path=os.path.join(SHOTS, name + '.png'), full_page=False)

def score(page, i):
    return int(page.locator(f'[data-score="{i}"]').first.inner_text())

def main():
    httpd = serve()
    base = f'http://localhost:{PORT}/'
    tmp = tempfile.mkdtemp()
    p0, p1 = os.path.join(tmp, 'a.jpg'), os.path.join(tmp, 'b.jpg')
    make_photo(p0, (190, 120, 100)); make_photo(p1, (110, 130, 160))

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        ctx = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        external = []
        ctx.on('request', lambda r: external.append(r.url) if not r.url.startswith(base) and not r.url.startswith(('data:', 'blob:')) else None)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))

        # ---- Perfiles ----
        page.goto(base)
        expect(page.locator('#setup-title')).to_have_text('Antes de empezar')
        page.click('[data-action="save-profiles"]')
        check('valida nombres vacíos', page.locator('#setup-error').is_visible())
        page.fill('#name-0', 'Valentina')
        page.fill('#name-1', 'Álvaro')
        page.set_input_files('#photo-0', p0)
        page.wait_for_selector('.profile-card:nth-of-type(1) .avatar img')
        page.set_input_files('#photo-1', p1)
        page.wait_for_function("document.querySelectorAll('.profile-card .avatar img').length === 2")
        check('vista previa de ambas fotos', page.locator('.profile-card .avatar img').count() == 2)
        shot(page, '01-perfiles')
        page.click('[data-action="save-profiles"]')

        # ---- Portada ----
        expect(page.locator('#cover-title')).to_contain_text('Entre todas las personas del mundo, hoy volvemos a elegirnos')
        page.wait_for_function("document.getElementById('cover-img').complete && document.getElementById('cover-img').naturalWidth > 0")
        check('portada con la foto cargada', page.evaluate("document.getElementById('cover-img').naturalWidth") > 0)
        check('portada guardada en IndexedDB (blob:)', page.evaluate("document.getElementById('cover-img').src").startswith('blob:'))
        check('texto del botón principal', page.locator('[data-action="new-game"]').inner_text().strip() == 'Comenzar nuestra cita ❤️')
        page.wait_for_timeout(600)
        shot(page, '02-portada')

        # Perfiles persisten tras recarga
        page.reload()
        expect(page.locator('#cover-title')).to_be_visible()
        check('no vuelve a pedir perfiles', page.locator('#setup-title').count() == 0)

        # ---- Quién empieza ----
        page.click('[data-action="new-game"]')
        expect(page.locator('#starter-title')).to_have_text('¿Quién se atreve a empezar?')
        check('botón deshabilitado sin elegir', page.locator('[data-action="confirm-starter"]').is_disabled())
        page.click('[data-testid="starter-1"]')
        shot(page, '03-quien-empieza')
        page.click('[data-action="confirm-starter"]')

        # ---- Nivel 1 ----
        expect(page.locator('#intro-title')).to_have_text('Lo cotidiano')
        shot(page, '04-intro-nivel1')
        page.click('[data-action="start-level"]')
        expect(page.locator('[data-testid="q-count"]')).to_have_text('Pregunta 1 de 20')
        check('turno inicial de quien se eligió', page.locator('[data-testid="turn-name"]').inner_text() == 'Álvaro')
        check('primera pregunta exacta', page.locator('#q-text').inner_text() == '¿Cuál es mi color favorito?')
        check('roles visibles (lee/adivina)', 'Adivina: Valentina' in page.locator('.roles').inner_text())
        shot(page, '05-pregunta-nivel1')

        # doble toque en «Acertó»
        btn = page.locator('[data-outcome="correct"]')
        btn.dblclick()
        page.wait_for_timeout(400)
        check('doble toque suma solo 1 punto', score(page, 0) == 1 and score(page, 1) == 0)
        check('cambia el turno', page.locator('[data-testid="turn-name"]').inner_text() == 'Valentina')
        expect(page.locator('[data-testid="q-count"]')).to_have_text('Pregunta 2 de 20')

        # fallo: nadie suma
        page.click('[data-outcome="failed"]')
        page.wait_for_timeout(300)
        check('«Falló» no suma', score(page, 0) == 1 and score(page, 1) == 0)

        # pasar
        page.click('[data-action="skip"]')
        page.wait_for_timeout(300)
        check('pasar no gasta comodín', page.locator('[data-testid="wildcards"] b').inner_text() == '3')

        # comodín: cancelar no consume
        q_before = page.locator('#q-text').inner_text()
        page.click('[data-action="wildcard"]')
        shot(page, '06-confirmar-comodin')
        page.click('[data-modal-cancel]')
        page.wait_for_timeout(500)
        check('cancelar comodín no lo consume', page.locator('[data-testid="wildcards"] b').inner_text() == '3')
        page.click('[data-action="wildcard"]')
        page.click('[data-modal-ok]')
        page.wait_for_timeout(300)
        check('comodín consumido (2)', page.locator('[data-testid="wildcards"] b').inner_text() == '2')
        level1 = page.evaluate("window.__cita.E.getLevel(1).questions.map(q => q.text)")
        q_after = page.locator('#q-text').inner_text()
        check('comodín cambia a otra pregunta del nivel 1', q_after != q_before and q_after in level1)

        # ---- Recarga a mitad de partida ----
        state_before = page.evaluate("JSON.stringify({s: window.__cita.app.game.scores, q: window.__cita.E.currentQuestionId(window.__cita.app.game), t: window.__cita.app.game.turn, w: window.__cita.app.game.wildcards})")
        page.wait_for_timeout(300)
        page.reload()
        expect(page.locator('[data-action="continue-game"]')).to_have_text('Continuar nuestra cita ❤️')
        check('ofrece empezar nueva cita', page.locator('[data-action="new-game"]').inner_text().strip() == 'Empezar una nueva cita')
        shot(page, '07-portada-continuar')
        # Nueva cita pide confirmación; cancelar no borra
        page.click('[data-action="new-game"]')
        expect(page.locator('.modal-title')).to_have_text('¿Empezar una nueva cita?')
        page.click('[data-modal-cancel]')
        page.wait_for_timeout(400)
        page.click('[data-action="continue-game"]')
        state_after = page.evaluate("JSON.stringify({s: window.__cita.app.game.scores, q: window.__cita.E.currentQuestionId(window.__cita.app.game), t: window.__cita.app.game.turn, w: window.__cita.app.game.wildcards})")
        check('estado idéntico tras recarga (puntos, pregunta, turno, comodines)', state_before == state_after)

        # ---- Sin conexión ----
        page.wait_for_function("navigator.serviceWorker && navigator.serviceWorker.controller !== null", timeout=10000)
        ctx.set_offline(True)
        page.reload()
        expect(page.locator('[data-action="continue-game"]')).to_be_visible()
        page.wait_for_function("document.getElementById('cover-img').complete && document.getElementById('cover-img').naturalWidth > 0")
        check('offline: portada visible', page.evaluate("document.getElementById('cover-img').naturalWidth") > 0)
        check('offline: fotos de perfil visibles', page.locator('.cover-couple .avatar img').count() == 2)
        check('offline: tipografía cargada', page.evaluate("document.fonts.check('16px Fraunces')"))
        check('offline: aviso de sin conexión', page.locator('#net-pill').is_visible())
        shot(page, '08-offline-portada')
        page.click('[data-action="continue-game"]')

        # Jugar todo el resto SIN conexión hasta el final
        def finish_level(outcome_guess='correct', outcome_self='answered'):
            for _ in range(25):
                if page.locator('.screen-question').count() == 0: return
                if page.locator('[data-outcome="correct"]').count():
                    page.click(f'[data-outcome="{outcome_guess}"]')
                else:
                    page.click(f'[data-outcome="{outcome_self}"]')
                page.wait_for_timeout(30)

        finish_level()
        expect(page.locator('#intro-title')).to_have_text('¿Cómo me ves?')
        check('avance automático tras 20 preguntas', True)
        page.click('[data-action="start-level"]')
        # avance anticipado con confirmación
        page.click('[data-action="advance-level"]')
        check('pide confirmación para avanzar', page.locator('.modal-title').inner_text() == '¿Avanzar al siguiente nivel?')
        s_before = (score(page, 0), score(page, 1))
        page.click('[data-modal-ok]')
        expect(page.locator('#intro-title')).to_have_text('Lo emocional')
        check('intro exacta del nivel 3', page.locator('[data-testid="level-intro"]').inner_text().startswith('Aquí no existen respuestas correctas.'))
        s_after = (score(page, 0), score(page, 1))
        check('avance anticipado no altera puntos', s_before == s_after)
        shot(page, '09-intro-nivel3')
        page.click('[data-action="start-level"]')
        t = page.evaluate("window.__cita.app.game.turn")
        before = page.evaluate("window.__cita.app.game.scores.slice()")
        page.click('[data-outcome="answered"]')
        page.wait_for_timeout(200)
        after = page.evaluate("window.__cita.app.game.scores.slice()")
        check('«He respondido» suma 3 en nivel 3', after[t] - before[t] == 3)
        shot(page, '10-pregunta-nivel3')
        finish_level()
        expect(page.locator('#intro-title')).to_have_text('Nuestra relación')
        page.click('[data-action="start-level"]')
        finish_level()
        expect(page.locator('#intro-title')).to_have_text('Intimidad y deseo')
        page.click('[data-action="start-level"]')
        shot(page, '11-pregunta-nivel5')
        finish_level()

        expect(page.locator('#final-title')).to_have_text('¡Llegaron al final! ❤️')
        scores = page.evaluate("window.__cita.app.game.scores")
        winner = page.evaluate("window.__cita.app.game.winner")
        check('marcador coherente con resultados', scores == page.evaluate("window.__cita.E.scoresFromResults(window.__cita.app.game)"))
        page.wait_for_timeout(400)
        shot(page, '12-final')
        if winner is not None:
            page.click('[data-action="open-prizes"]')
            check('exactamente 4 premios', page.locator('.prize-card').count() == 4)
            shot(page, '13-premios')
            page.click('[data-testid="prize-sensual"]')
            page.click('[data-action="confirm-prize"]')
            expect(page.locator('#prize-title')).to_have_text('Quince minutos para ti')
            shot(page, '14-premio-elegido')
        ctx.set_offline(False)

        # ---- Desempate (partida nueva: todos fallan → 0-0) ----
        page.click('[data-action="new-game"]')
        page.click('[data-modal-ok]')
        page.click('[data-testid="starter-0"]')
        page.click('[data-action="confirm-starter"]')
        for _ in range(5):
            page.click('[data-action="start-level"]')
            page.click('[data-action="advance-level"]')
            page.click('[data-modal-ok]')
            page.wait_for_timeout(450)
            if page.locator('#final-title').count(): break
        expect(page.locator('[data-testid="verdict"]')).to_contain_text('Empate')
        page.click('[data-action="start-tiebreak"]')
        shot(page, '15-desempate')
        page.click('[data-outcome="failed"]')
        page.wait_for_timeout(200)
        page.click('[data-outcome="unclear"]')
        page.wait_for_timeout(200)
        page.locator('[data-action="tb-result"][data-outcome="correct"]').dblclick()
        page.wait_for_timeout(300)
        g = page.evaluate("window.__cita.app.game")
        check('desempate decide ganador', g['winner'] in (0, 1) and g['winnerBy'] == 'tiebreak')
        check('desempate no cambia marcador', g['scores'] == [0, 0])
        check('sin comodines gastados en partida nueva', g['wildcards'] == 3)

        # ---- Pantalla pequeña ----
        page.set_viewport_size({'width': 320, 'height': 568})
        page.click('[data-action="go-cover"]')
        page.wait_for_timeout(300)
        overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
        check('sin scroll horizontal a 320px (portada)', not overflow)
        shot(page, '16-portada-320')
        page.click('[data-action="continue-game"]')
        overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
        check('sin scroll horizontal a 320px (final)', not overflow)

        # ---- Borrar datos ----
        page.click('[data-action="go-cover"]')
        page.click('[data-action="wipe-data"]')
        page.click('[data-modal-cancel]')
        page.wait_for_timeout(500)
        check('cancelar borrado conserva datos', page.locator('#cover-title').count() == 1)
        page.click('[data-action="wipe-data"]')
        page.click('[data-modal-ok]')
        expect(page.locator('#setup-title')).to_have_text('Antes de empezar')
        page.reload()
        expect(page.locator('#setup-title')).to_be_visible()
        check('borrado total confirmado', page.evaluate("window.__cita.app.game") is None)

        check('sin peticiones a servidores externos', len(external) == 0)
        if external: print('  externas:', external[:5])
        check('sin errores de JavaScript', len(errors) == 0)
        if errors: print('  errores:', errors[:5])
        browser.close()
    httpd.shutdown()
    failed = [n for n, ok in results if not ok]
    print(f'\n{len(results) - len(failed)}/{len(results)} comprobaciones superadas. Capturas en {SHOTS}')
    sys.exit(1 if failed else 0)

if __name__ == '__main__':
    main()
