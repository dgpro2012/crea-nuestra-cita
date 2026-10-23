// Datos de los cinco niveles. Preguntas copiadas textualmente del documento de requisitos.
// Los niveles 1 y 2 NO incluyen respuestas: la app no conoce las respuestas correctas.
export const LEVELS = Object.freeze([
  {
    "id": 1,
    "name": "LO COTIDIANO",
    "points": 1,
    "mode": "guess",
    "intro": "Para calentar motores. Una persona lee una pregunta sobre sí misma y la otra intenta adivinar. ¿Cuánto se conocen de verdad?",
    "questions": [
      {
        "id": "n1-q01",
        "text": "¿Cuál es mi color favorito?"
      },
      {
        "id": "n1-q02",
        "text": "¿Cuál es mi comida favorita?"
      },
      {
        "id": "n1-q03",
        "text": "¿Cuál es mi mayor fobia o miedo?"
      },
      {
        "id": "n1-q04",
        "text": "¿Cuál es mi animal favorito?"
      },
      {
        "id": "n1-q05",
        "text": "¿Cuál es mi libro favorito?"
      },
      {
        "id": "n1-q06",
        "text": "¿Quién es mi cantante o artista musical favorito?"
      },
      {
        "id": "n1-q07",
        "text": "¿Cuál es mi película favorita?"
      },
      {
        "id": "n1-q08",
        "text": "¿Cuál es mi serie favorita?"
      },
      {
        "id": "n1-q09",
        "text": "¿Cuál es mi canción favorita?"
      },
      {
        "id": "n1-q10",
        "text": "¿Cuál es mi postre favorito?"
      },
      {
        "id": "n1-q11",
        "text": "¿Qué comida no me gusta para nada?"
      },
      {
        "id": "n1-q12",
        "text": "¿Qué es lo que menos soporto en una persona?"
      },
      {
        "id": "n1-q13",
        "text": "¿Cuál es mi bebida favorita?"
      },
      {
        "id": "n1-q14",
        "text": "¿Prefiero la playa, la montaña o la ciudad?"
      },
      {
        "id": "n1-q15",
        "text": "¿Cuál es mi estación del año o tipo de clima favorito?"
      },
      {
        "id": "n1-q16",
        "text": "¿Soy más de madrugar o de trasnochar?"
      },
      {
        "id": "n1-q17",
        "text": "¿Qué es lo primero que suelo hacer al despertarme?"
      },
      {
        "id": "n1-q18",
        "text": "¿Qué actividad disfruto hacer en mi tiempo libre?"
      },
      {
        "id": "n1-q19",
        "text": "¿Qué cosa me pone de mal humor rápidamente?"
      },
      {
        "id": "n1-q20",
        "text": "Si pudiera comprarme cualquier cosa ahora mismo, ¿qué elegiría?"
      }
    ]
  },
  {
    "id": 2,
    "name": "¿CÓMO ME VES?",
    "points": 2,
    "mode": "guess",
    "intro": "Ahora toca mirarse con otros ojos. Adivina cómo te ve tu pareja: lo que le encanta, lo que le cuesta y lo que la enamoró.",
    "questions": [
      {
        "id": "n2-q01",
        "text": "¿Qué es lo que más me gusta de ti?"
      },
      {
        "id": "n2-q02",
        "text": "¿Qué es lo que más me enoja de ti?"
      },
      {
        "id": "n2-q03",
        "text": "Si pudiera cambiar una sola cosa de ti, ¿qué cambiaría?"
      },
      {
        "id": "n2-q04",
        "text": "¿Cuáles son las tres cosas que más me gustan de ti?"
      },
      {
        "id": "n2-q05",
        "text": "¿Qué fue lo que me enamoró de ti?"
      },
      {
        "id": "n2-q06",
        "text": "¿Cuál creo que es tu mayor virtud?"
      },
      {
        "id": "n2-q07",
        "text": "¿Qué característica tuya me parece más atractiva?"
      },
      {
        "id": "n2-q08",
        "text": "¿Qué creo que te hace diferente de las demás personas?"
      },
      {
        "id": "n2-q09",
        "text": "¿Qué comportamiento tuyo me cuesta más entender?"
      },
      {
        "id": "n2-q10",
        "text": "¿Qué es lo que más admiro de ti?"
      },
      {
        "id": "n2-q11",
        "text": "¿Qué creo que es lo más difícil de estar en una relación conmigo?"
      },
      {
        "id": "n2-q12",
        "text": "¿Qué crees que considero tu mayor defecto?"
      },
      {
        "id": "n2-q13",
        "text": "¿En qué situación creo que eres más difícil de tratar?"
      },
      {
        "id": "n2-q14",
        "text": "¿Qué cosa haces que consigue sacarme una sonrisa incluso cuando estoy de mal humor?"
      },
      {
        "id": "n2-q15",
        "text": "¿Qué creo que es lo que mejor haces como pareja?"
      },
      {
        "id": "n2-q16",
        "text": "¿Qué aspecto de tu personalidad creo que pocas personas conocen de verdad?"
      },
      {
        "id": "n2-q17",
        "text": "¿Qué creo que podrías mejorar para que nuestra relación funcione todavía mejor?"
      },
      {
        "id": "n2-q18",
        "text": "¿Qué es lo que más miedo me daría perder de nuestra relación?"
      },
      {
        "id": "n2-q19",
        "text": "¿Qué creo que nos hace funcionar bien como pareja?"
      },
      {
        "id": "n2-q20",
        "text": "Si tuviera que describirte con tres palabras, ¿cuáles elegiría?"
      }
    ]
  },
  {
    "id": 3,
    "name": "LO EMOCIONAL",
    "points": 3,
    "mode": "self",
    "intro": "Aquí no existen respuestas correctas. El punto se asigna cuando termines de responder. Puedes pasar cualquier pregunta sin explicaciones ni penalización",
    "questions": [
      {
        "id": "n3-q01",
        "text": "¿Qué es lo que más me preocupa de mi vida actualmente, pero casi nunca digo en voz alta?"
      },
      {
        "id": "n3-q02",
        "text": "¿Cuál es mi inseguridad más grande y cómo afecta la forma en que me relaciono con los demás?"
      },
      {
        "id": "n3-q03",
        "text": "Cuando estoy triste y siento que no puedo más, ¿qué necesito de mi pareja para sentirme verdaderamente acompañado/a?"
      },
      {
        "id": "n3-q04",
        "text": "¿Qué emoción me cuesta más expresar y qué temo que pase si dejo que los demás la vean?"
      },
      {
        "id": "n3-q05",
        "text": "¿Cuál es uno de mis miedos más profundos, ese que intento esconder incluso de las personas que más quiero?"
      },
      {
        "id": "n3-q06",
        "text": "¿Qué palabras, actitudes o comentarios pueden herirme profundamente porque tocan una inseguridad que llevo dentro?"
      },
      {
        "id": "n3-q07",
        "text": "Cuando alguien me hace daño, ¿suelo hablarlo, alejarme, fingir que no me importa o guardármelo? ¿Qué hay detrás de mi reacción?"
      },
      {
        "id": "n3-q08",
        "text": "¿Cuál es mi lenguaje del amor y qué necesito recibir para sentirme verdaderamente amado/a, más allá de las palabras?"
      },
      {
        "id": "n3-q09",
        "text": "¿Cuándo fue la primera vez que sentí que me rompieron el corazón durante mi infancia y cómo creo que esa experiencia me marcó?"
      },
      {
        "id": "n3-q10",
        "text": "¿Qué aspecto de mí mismo/a intento ocultar por miedo a que, si los demás lo conocieran, dejaran de quererme o admirarme?"
      },
      {
        "id": "n3-q11",
        "text": "¿Tengo miedo al rechazo? ¿De qué manera influye ese miedo en las decisiones que tomo, en mis relaciones o en la forma en que me muestro ante los demás?"
      },
      {
        "id": "n3-q12",
        "text": "¿Qué es lo que más vergüenza me da de mí mismo/a y qué creo que los demás pensarían si lo supieran?"
      },
      {
        "id": "n3-q13",
        "text": "¿Qué necesito de mi pareja para sentirme emocionalmente seguro/a y poder mostrarme tal como soy, sin miedo a ser juzgado/a?"
      },
      {
        "id": "n3-q14",
        "text": "¿Qué es algo que todavía no me he perdonado y por qué sigo siendo tan duro/a conmigo mismo/a por ello?"
      },
      {
        "id": "n3-q15",
        "text": "¿Qué hago realmente para sobrellevarlo cuando siento que todo me supera y qué me gustaría poder hacer en lugar de eso?"
      },
      {
        "id": "n3-q16",
        "text": "¿Qué parte de mi personalidad creo que desarrollé para protegerme del dolor, aunque hoy esa misma parte pueda dificultar mis relaciones?"
      },
      {
        "id": "n3-q17",
        "text": "¿Qué experiencia de mi infancia creo que todavía influye en mi forma de amar, confiar o reaccionar cuando alguien me importa?"
      },
      {
        "id": "n3-q18",
        "text": "¿Qué me duele más: sentir que he decepcionado a alguien que amo o descubrir que alguien a quien amo me ha decepcionado? ¿Qué dice eso sobre mí?"
      },
      {
        "id": "n3-q19",
        "text": "Cuando siento que alguien importante se está alejando de mí, ¿qué es lo primero que pienso y cómo suelo actuar por miedo a perderlo?"
      },
      {
        "id": "n3-q20",
        "text": "¿Qué sueño o deseo personal he dejado de lado y qué me ha impedido luchar por él?"
      }
    ]
  },
  {
    "id": 4,
    "name": "NUESTRA RELACIÓN",
    "points": 4,
    "mode": "self",
    "intro": "Míranos con honestidad. Este nivel es una oportunidad para hablar de nosotros sin convertir la conversación en una discusión. No tienes que proteger la relación ocultando lo que sientes, pero tampoco necesitas herir para decir la verdad. Escucha para comprender, no para defenderte. Pueden sentir cosas diferentes y ambas perspectivas merecen ser escuchadas",
    "questions": [
      {
        "id": "n4-q01",
        "text": "¿Qué es lo que más miedo me da perder de nuestra relación y por qué es tan importante para mí?"
      },
      {
        "id": "n4-q02",
        "text": "¿Qué situaciones despiertan mis celos y qué miedo se esconde realmente detrás de ellos?"
      },
      {
        "id": "n4-q03",
        "text": "¿Alguna vez he sentido que tengo que competir con alguien o algo para recibir la atención de mi pareja? ¿Qué me hizo sentir así?"
      },
      {
        "id": "n4-q04",
        "text": "¿Qué tendría que pasar para que perdiera la confianza en mi pareja y sintiera que ya no puedo recuperarla?"
      },
      {
        "id": "n4-q05",
        "text": "¿Qué significa para mí ser infiel, más allá de tener relaciones sexuales con otra persona?"
      },
      {
        "id": "n4-q06",
        "text": "¿Hay algo que me dé miedo contarle a mi pareja porque temo que cambie la forma en que me ve o me quiera?"
      },
      {
        "id": "n4-q07",
        "text": "¿Qué necesita hacer mi pareja para que yo me sienta seguro/a de que realmente me elige, incluso cuando estamos pasando por un mal momento?"
      },
      {
        "id": "n4-q08",
        "text": "¿Qué límite personal jamás quisiera tener que sacrificar para mantener nuestra relación?"
      },
      {
        "id": "n4-q09",
        "text": "¿En qué situaciones siento que mi pareja invade mi espacio, limita mi libertad o no respeta suficientemente mis decisiones?"
      },
      {
        "id": "n4-q10",
        "text": "¿Qué cosas me cuesta tolerar por miedo a que, si expreso lo que necesito, mi pareja se aleje de mí?"
      },
      {
        "id": "n4-q11",
        "text": "¿Alguna vez he dudado del amor de mi pareja, aunque no se lo haya dicho? ¿Qué provocó esa duda?"
      },
      {
        "id": "n4-q12",
        "text": "¿Qué comportamiento de mi pareja podría hacerme sentir reemplazable o poco importante dentro de nuestra relación?"
      },
      {
        "id": "n4-q13",
        "text": "¿Qué me cuesta más: confiar plenamente en mi pareja o creer que soy suficiente para que me siga eligiendo? ¿Por qué?"
      },
      {
        "id": "n4-q14",
        "text": "¿Qué considero una falta de respeto dentro de una relación, aunque otras personas puedan verlo como algo normal?"
      },
      {
        "id": "n4-q15",
        "text": "Cuando tengo miedo de perder a mi pareja, ¿cómo cambia mi manera de actuar con ella?"
      },
      {
        "id": "n4-q16",
        "text": "¿Hay alguna experiencia de una relación anterior o de mi infancia que todavía influya en mi capacidad de confiar en mi pareja actual?"
      },
      {
        "id": "n4-q17",
        "text": "¿Qué necesitaría de mi pareja para poder hablar de mis inseguridades sin sentir que me estoy exponiendo demasiado?"
      },
      {
        "id": "n4-q18",
        "text": "¿Qué situación podría hacerme quedarme en una relación en la que ya no me siento feliz, por miedo a estar solo/a o empezar de nuevo?"
      },
      {
        "id": "n4-q19",
        "text": "¿Qué verdad sobre nuestra relación me daría miedo escuchar de mi pareja, aunque una parte de mí necesite conocerla?"
      },
      {
        "id": "n4-q20",
        "text": "¿Qué tendría que sentir, recibir y vivir dentro de nuestra relación para poder amar sin estar constantemente protegiéndome del dolor?"
      }
    ]
  },
  {
    "id": 5,
    "name": "INTIMIDAD Y DESEO",
    "points": 5,
    "mode": "self",
    "intro": "Atrévete a decir lo que deseas. Aquí puedes hablar de sexo, fantasías, placer y curiosidades sin vergüenza. No tienes que fingir que algo te gusta ni aceptar algo que no deseas. Una fantasía se puede compartir sin tener que cumplirla. La curiosidad se puede explorar sin presión",
    "questions": [
      {
        "id": "n5-q01",
        "text": "¿Qué es lo que más me excita físicamente de mi pareja y qué tiene eso que me provoca tanto deseo?"
      },
      {
        "id": "n5-q02",
        "text": "¿Qué tipo de iniciativa sexual me gustaría que mi pareja tomara más a menudo conmigo?"
      },
      {
        "id": "n5-q03",
        "text": "¿Prefiero ser quien seduce y toma la iniciativa o que mi pareja me sorprenda? ¿Qué me gusta de ese papel?"
      },
      {
        "id": "n5-q04",
        "text": "¿Qué tipo de beso, caricia o contacto consigue despertar mi deseo más rápidamente?"
      },
      {
        "id": "n5-q05",
        "text": "¿Qué me gustaría que mi pareja me dijera al oído durante un momento íntimo para excitarme?"
      },
      {
        "id": "n5-q06",
        "text": "¿Qué fantasía sexual me da curiosidad explorar con mi pareja, aunque todavía no me haya atrevido a proponerla?"
      },
      {
        "id": "n5-q07",
        "text": "¿Hay alguna práctica sexual que me intrigue y sobre la que me gustaría hablar con mi pareja para descubrir si también le interesa?"
      },
      {
        "id": "n5-q08",
        "text": "¿Qué situación, lugar o ambiente me parece especialmente excitante para tener intimidad?"
      },
      {
        "id": "n5-q09",
        "text": "¿Qué parte de mi cuerpo me encanta que mi pareja toque o bese y me gustaría que explorara más?"
      },
      {
        "id": "n5-q10",
        "text": "¿Qué deseo sexual me cuesta pedir por vergüenza o por miedo a que mi pareja me juzgue?"
      },
      {
        "id": "n5-q11",
        "text": "¿Qué me gusta más: una seducción lenta que aumente la tensión o un acercamiento directo y apasionado? ¿Por qué?"
      },
      {
        "id": "n5-q12",
        "text": "¿Qué podría hacer mi pareja para sorprenderme sexualmente de una manera que realmente disfrute?"
      },
      {
        "id": "n5-q13",
        "text": "¿Qué me ayuda a disfrutar más del sexo: sentir conexión emocional, tener tiempo para explorar, recibir caricias, hablar de lo que me gusta u otra cosa?"
      },
      {
        "id": "n5-q14",
        "text": "¿Qué me gustaría que mi pareja entendiera mejor sobre mi placer y sobre lo que necesito para disfrutar plenamente?"
      },
      {
        "id": "n5-q15",
        "text": "¿Hay algo que hayamos hecho sexualmente y que me gustaría repetir, cambiar o explorar de una manera diferente?"
      },
      {
        "id": "n5-q16",
        "text": "¿Qué tipo de juego de seducción entre nosotros me gustaría probar: provocarnos durante el día, enviarnos mensajes sugerentes, preparar una cita sensual u otra idea?"
      },
      {
        "id": "n5-q17",
        "text": "¿Qué me resulta más excitante de sentirme deseado/a: que mi pareja me lo diga, que tome la iniciativa, que me mire de cierta manera o que me lo demuestre con su contacto?"
      },
      {
        "id": "n5-q18",
        "text": "¿Qué límite sexual es importante para mí y cómo me gustaría comunicarlo para sentirme respetado/a y disfrutar con confianza?"
      },
      {
        "id": "n5-q19",
        "text": "¿Si supiera que mi pareja me escuchará sin juzgarme, qué conversación sobre sexo, placer o fantasías me gustaría tener con ella?"
      },
      {
        "id": "n5-q20",
        "text": "Si pudiéramos dedicar una noche exclusivamente a descubrir el placer del otro, sin prisas, expectativas ni obligación de llegar a ningún resultado, ¿qué me gustaría proponer?"
      }
    ]
  }
]);

export const LEVEL_COUNT = LEVELS.length;
export const QUESTIONS_PER_LEVEL = 20;
