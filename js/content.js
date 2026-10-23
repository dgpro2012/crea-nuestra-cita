// Textos fijos de la experiencia: nombres visibles de nivel, premios y preguntas de desempate.

export const LEVEL_TITLES = {
  1: 'Lo cotidiano',
  2: '¿Cómo me ves?',
  3: 'Lo emocional',
  4: 'Nuestra relación',
  5: 'Intimidad y deseo',
};

export const LEVEL_EMOJI = { 1: '☕', 2: '👀', 3: '🫶', 4: '💞', 5: '🔥' };

// Exactamente cuatro premios.
export const PRIZES = Object.freeze([
  {
    id: 'romantico',
    tag: 'Romántico',
    emoji: '💌',
    title: 'Una carta de amor',
    text: 'Tu pareja te escribe una carta con tres cosas que ama de ti y algo que desea vivir contigo.',
  },
  {
    id: 'divertido',
    tag: 'Divertido',
    emoji: '🎉',
    title: 'Tu deseo es mi orden',
    text: 'El ganador elige una actividad divertida para hacer juntos, como bailar una canción, recrear una escena romántica o hacer un reto de imitaciones.',
  },
  {
    id: 'sensual',
    tag: 'Sensual',
    emoji: '🕯️',
    title: 'Quince minutos para ti',
    text: 'Tu pareja te dedica 15 minutos de caricias o un masaje relajante, adaptados a lo que te resulte agradable.',
  },
  {
    id: 'intimo',
    tag: 'Íntimo',
    emoji: '🌙',
    title: 'Tu fantasía compartida',
    text: 'El ganador elige una fantasía o deseo para conversar y, si ambos quieren, explorar juntos sin presiones.',
  },
]);

export const PRIZE_RULES = [
  'Ambos deben sentirse cómodos con la experiencia.',
  'Cualquiera puede rechazar una propuesta o elegir una alternativa sin penalización.',
  'Ningún premio implica obligación sexual.',
];

// Preguntas de desempate: conocimiento concreto sobre la pareja, con una respuesta verificable.
// No forman parte de los cinco niveles y no suman puntos al marcador principal.
export const TIEBREAK_QUESTIONS = Object.freeze([
  '¿En qué fecha nos conocimos (día y mes)?',
  '¿Qué número de zapato uso?',
  '¿En qué ciudad nací?',
  '¿Cuál es mi segundo nombre o mi segundo apellido?',
  '¿Cuál fue el primer lugar al que salimos juntos?',
  '¿Qué día y mes es mi cumpleaños?',
  '¿Cómo se llama mi mejor amigo o mejor amiga?',
  '¿Cuál fue mi primer trabajo?',
  '¿Qué pedí la última vez que comimos juntos fuera de casa?',
  '¿Cuántos hermanos o hermanas tengo?',
  '¿Cuál es el nombre de mi mamá?',
  '¿Qué mano uso para escribir?',
]);
