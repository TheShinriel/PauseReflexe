export const MIN_BYPASS_DURATION_MINUTES = 2;
export const MAX_BYPASS_DURATION_MINUTES = 30;
export const DEFAULT_BYPASS_DURATION_MINUTES = 10;

export function clampDuration(minutes) {
  const value = Math.round(Number(minutes));
  if (!Number.isFinite(value)) return DEFAULT_BYPASS_DURATION_MINUTES;
  return Math.min(MAX_BYPASS_DURATION_MINUTES, Math.max(MIN_BYPASS_DURATION_MINUTES, value));
}

export function getDefaultDuration() {
  return DEFAULT_BYPASS_DURATION_MINUTES;
}

export function getDurationLabel(minutes) {
  return `${clampDuration(minutes)} min`;
}
