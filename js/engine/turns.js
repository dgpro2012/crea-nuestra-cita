// Alternancia de turnos y roles visibles en cada pregunta.
import { getLevel, other } from './state.js';

/** Cambia el turno al otro jugador (muta el estado recibido, que ya es una copia). */
export function alternateTurn(state) {
  state.turn = other(state.turn);
  return state;
}

/**
 * Roles para la pregunta en curso.
 * Niveles 1-2 (adivinanza): quien tiene el turno lee una pregunta sobre sí mismo,
 * su pareja adivina y quien tiene el turno evalúa. Los puntos van a quien adivina.
 * Niveles 3-5: quien tiene el turno responde sobre sí mismo y recibe los puntos.
 */
export function rolesFor(state) {
  const level = getLevel(state.level);
  const t = state.turn;
  if (level.mode === 'guess') {
    return { mode: 'guess', reader: t, subject: t, guesser: other(t), evaluator: t, scorer: other(t) };
  }
  return { mode: 'self', reader: t, subject: t, answerer: t, scorer: t };
}
