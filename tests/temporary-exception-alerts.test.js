import { describe, expect, it } from 'vitest';
import {
  getExpiryAlertDelayMs,
  getSoftReminderDelayMs,
  shouldScheduleTemporaryExceptionAlerts,
} from '../src/shared/temporary-exception-alerts.js';

describe('temporary exception alerts', () => {
  it('does not schedule alerts without a future exception', () => {
    expect(shouldScheduleTemporaryExceptionAlerts({ until: undefined, now: 1000 })).toBe(false);
    expect(shouldScheduleTemporaryExceptionAlerts({ until: 999, now: 1000 })).toBe(false);
    expect(shouldScheduleTemporaryExceptionAlerts({ until: 1000, now: 1000 })).toBe(false);
  });

  it('schedules expiry alert for the remaining exception duration', () => {
    expect(shouldScheduleTemporaryExceptionAlerts({ until: 4000, now: 1000 })).toBe(true);
    expect(getExpiryAlertDelayMs({ until: 4000, now: 1000 })).toBe(3000);
  });

  it('schedules soft reminder only when there is time left after the reminder delay', () => {
    const tenMinutes = 10 * 60 * 1000;
    expect(getSoftReminderDelayMs({ until: tenMinutes - 1, now: 0 })).toBe(null);
    expect(getSoftReminderDelayMs({ until: tenMinutes, now: 0 })).toBe(null);
    expect(getSoftReminderDelayMs({ until: tenMinutes + 1, now: 0 })).toBe(tenMinutes);
  });
});
