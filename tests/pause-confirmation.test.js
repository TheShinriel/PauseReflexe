import { describe, expect, it } from 'vitest';
import { requiresPauseConfirmation } from '../src/shared/pause-confirmation.js';

describe('requiresPauseConfirmation', () => {
  it('requires confirmation when enabling global pause', () => {
    expect(requiresPauseConfirmation({ currentPaused: false, nextPaused: true })).toBe(true);
  });

  it('does not require confirmation when re-enabling blockers', () => {
    expect(requiresPauseConfirmation({ currentPaused: true, nextPaused: false })).toBe(false);
  });

  it('does not require confirmation when state does not change', () => {
    expect(requiresPauseConfirmation({ currentPaused: false, nextPaused: false })).toBe(false);
    expect(requiresPauseConfirmation({ currentPaused: true, nextPaused: true })).toBe(false);
  });
});
