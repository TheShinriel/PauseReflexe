import { describe, expect, it } from 'vitest';
import { BYPASS_DURATIONS_MINUTES, getDurationLabel, getDefaultDuration } from '../src/shared/durations.js';

describe('bypass durations', () => {
  it('offers the intentional bypass durations in minutes', () => {
    expect(BYPASS_DURATIONS_MINUTES).toEqual([5, 10, 30]);
  });

  it('formats duration labels consistently', () => {
    expect(getDurationLabel(5)).toBe('5 min');
    expect(getDurationLabel(10)).toBe('10 min');
    expect(getDurationLabel(30)).toBe('30 min');
  });

  it('defaults to ten minutes', () => {
    expect(getDefaultDuration()).toBe(10);
  });
});
