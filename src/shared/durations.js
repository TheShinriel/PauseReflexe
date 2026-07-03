export const BYPASS_DURATIONS_MINUTES = [5, 10, 30];
export const DEFAULT_BYPASS_DURATION_MINUTES = 10;

export function getDefaultDuration() {
  return DEFAULT_BYPASS_DURATION_MINUTES;
}

export function getDurationLabel(minutes) {
  return `${minutes} min`;
}
