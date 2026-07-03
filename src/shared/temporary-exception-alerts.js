export const SOFT_REMINDER_DELAY_MS = 10 * 60 * 1000;

export function shouldScheduleTemporaryExceptionAlerts({ until, now = Date.now() }) {
  return Number.isFinite(until) && until > now;
}

export function getExpiryAlertDelayMs({ until, now = Date.now() }) {
  if (!shouldScheduleTemporaryExceptionAlerts({ until, now })) return null;
  return until - now;
}

export function getSoftReminderDelayMs({ until, now = Date.now(), reminderDelayMs = SOFT_REMINDER_DELAY_MS }) {
  if (!shouldScheduleTemporaryExceptionAlerts({ until, now })) return null;
  return until - now > reminderDelayMs ? reminderDelayMs : null;
}
