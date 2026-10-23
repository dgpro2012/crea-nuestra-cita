# Crea nuestra cita ❤️

PWA para que una pareja viva una cita interactiva en un solo teléfono: cinco niveles de 20 preguntas, marcador, comodines, desempate y cuatro premios. Funciona sin conexión después de la primera carga y todo se guarda solo en el dispositivo.

Sin frameworks ni compilación: HTML, CSS y JavaScript (módulos ES). Tipografías (Fraunces y DM Sans) incluidas en `fonts/`.

## Ejecutarla en tu computador

Necesitas un servidor local (los módulos y el service worker no funcionan abriendo el archivo con doble clic).

```bash
cd cita
python3 -m http.server 8080
# abre http://localhost:8080
```

Para probarla en el teléfono, publícala con HTTPS (abajo): el service worker y la instalación exigen `https://` (o `localhost`).

## Publicarla con un enlace

Cualquier hosting estático con HTTPS sirve. Las tres opciones más simples:

- **Netlify Drop**: entra a https://app.netlify.com/drop y arrastra la carpeta `cita`. Te da un enlace `https://….netlify.app` al instante.
- **GitHub Pages**: sube la carpeta a un repositorio, ve a *Settings → Pages*, elige la rama `main` y la carpeta raíz. Enlace: `https://usuario.github.io/repositorio/`.
- **Vercel**: `npx vercel` dentro de la carpeta, o importa el repositorio desde vercel.com.

> Privacidad: este repositorio no incluye ninguna foto personal. `img/portada.jpg` es una ilustración neutra. La foto de pareja se elige en el teléfono («Foto de portada» al configurar, o «Agregar nuestra foto de portada» en la portada) y queda guardada solo en ese dispositivo, igual que nombres, fotos de perfil y partidas.

## Instalarla en el teléfono

1. Abre el enlace HTTPS una vez **con internet** (esa primera visita descarga y guarda todos los archivos).
2. iPhone (Safari): botón Compartir → «Agregar a pantalla de inicio».
   Android (Chrome): menú ⋮ → «Instalar app» o «Agregar a pantalla principal».

## Verificar que funciona sin conexión

1. Abre la app con internet y espera a ver la portada (en ese momento ya quedó guardada).
2. Activa el modo avión.
3. Cierra la app por completo y vuelve a abrirla desde el ícono.
4. Debe aparecer la portada con su foto, las fotos de perfil y la franja «Sin conexión · la cita sigue funcionando». Pueden jugar hasta el final.

En computador: DevTools → Application → Service Workers (debe estar *activated*) y Network → *Offline*, luego recarga.

## Estructura

```
index.html              Contenedor, aviso si falta un recurso esencial
manifest.webmanifest    Instalación PWA
sw.js                   Caché offline (cambia VERSION al publicar cambios)
css/styles.css          Estilos mobile-first
js/data.js              Las 100 preguntas, textuales, y las introducciones
js/content.js           Títulos, 4 premios, preguntas de desempate
js/engine/              Lógica pura (probada en Node)
  state.js              Estado de la partida y validación
  turns.js              Alternancia y roles (lee / adivina / evalúa / responde)
  scoring.js            Registro de resultados y puntos sin duplicados
  wildcards.js          Comodines (mismo nivel, máximo 3)
  levels.js             Inicio, avance automático y anticipado, premio
  tiebreak.js           Desempate sin tocar el marcador
js/storage.js           IndexedDB (fotos y partida) + respaldo en localStorage
js/images.js            Reducción de fotos en el propio teléfono
js/ui/                  Pantallas: perfiles, portada, juego, final y premios
js/app.js               Navegación, acciones y arranque
tests/                  Pruebas del motor (Node) y de extremo a extremo (Playwright)
```

## Pruebas

```bash
node --test tests/engine.test.mjs          # 17 pruebas del motor
pip install playwright && python3 -m playwright install chromium
python3 tests/e2e.py                       # 39 comprobaciones en navegador móvil
```

## Reglas implementadas (resumen)

- Niveles 1–2: quien tiene el turno lee una pregunta sobre sí, su pareja adivina y quien leyó marca «Acertó» (puntos para quien adivinó) o «Falló» (nadie suma). La app no conoce las respuestas.
- Niveles 3–5: quien tiene el turno responde sobre sí y pulsa «He respondido» (suma 3, 4 o 5).
- «Pasar pregunta» en todos los niveles: no suma, no resta, no gasta comodín. Una pregunta pasada no puede puntuar después.
- 3 comodines para toda la cita: cambian la pregunta por otra pendiente del mismo nivel; si no hay alternativa, no se gastan. La pregunta cambiada cuenta como una de las 20 del nivel.
- Avance automático al resolver las 20; avance anticipado con confirmación (las pendientes quedan sin puntos).
- Empate: preguntas de desempate (A adivina un dato de B; si falla, B adivina uno de A; si ambos fallan o no hay respuesta clara, otra pregunta). El marcador no cambia.
