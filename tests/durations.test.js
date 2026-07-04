import { describe, expect, it } from 'vitest';
import {
  clampDuration,
  getDurationLabel,
  getDefaultDuration,
  MAX_BYPASS_DURATION_MINUTES,
  MIN_BYPASS_DURATION_MINUTES,
} from '../src/shared/durations.js';

describe('bypass durations', () => {
  it('offers a slider range from two to thirty minutes', () => {
    expect(MIN_BYPASS_DURATION_MINUTES).toBe(2);
    expect(MAX_BYPASS_DURATION_MINUTES).toBe(30);
  });

  it('clamps duration values to the intentional slider range', () => {
    expect(clampDuration(1)).toBe(2);
    expect(clampDuration(12)).toBe(12);
    expect(clampDuration(31)).toBe(30);
    expect(clampDuration('not a number')).toBe(10);
  });

  it('formats duration labels consistently', () => {
    expect(getDurationLabel(2)).toBe('2 min');
    expect(getDurationLabel(10)).toBe('10 min');
    expect(getDurationLabel(30)).toBe('30 min');
  });

  it('defaults to ten minutes', () => {
    expect(getDefaultDuration()).toBe(10);
  });
});
