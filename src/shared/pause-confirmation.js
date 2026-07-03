export function requiresPauseConfirmation({ currentPaused, nextPaused }) {
  return !currentPaused && nextPaused;
}
