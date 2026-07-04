import { describe, expect, it } from 'vitest';
import {
  APP_COPY,
  BLOCKED_PAGE_MESSAGES,
  PAUSE_SUCCESS_MESSAGES,
  getBlockedPageMessage,
  getExceptionCta,
  getPauseSuccessMessage,
  getRandomPauseSuccessMessage,
} from '../src/shared/copy.js';

describe('Pause Réflexe copy', () => {
  it('defines the validated app identity', () => {
    expect(APP_COPY.name).toBe('Pause Réflexe');
    expect(APP_COPY.description).toBe('Reprends la main sur les sites que tu ouvres par réflexe.');
  });

  it('keeps a compact mixed-tone blocked-page message pool', () => {
    expect(BLOCKED_PAGE_MESSAGES).toHaveLength(6);
    expect(BLOCKED_PAGE_MESSAGES).toContain('Tu voulais vraiment venir ici, ou ton réflexe a gagné ?');
    expect(BLOCKED_PAGE_MESSAGES).toContain('Tu voulais éviter d’aller sur ce site par réflexe. Prends 5 secondes avant de continuer.');
  });

  it('selects blocked-page messages predictably with fallback', () => {
    expect(getBlockedPageMessage(0)).toBe(BLOCKED_PAGE_MESSAGES[0]);
    expect(getBlockedPageMessage(6)).toBe(BLOCKED_PAGE_MESSAGES[0]);
    expect(getBlockedPageMessage(-1)).toBe(BLOCKED_PAGE_MESSAGES[0]);
    expect(getBlockedPageMessage()).toBe(BLOCKED_PAGE_MESSAGES[0]);
  });

  it('formats temporary exception CTA copy', () => {
    expect(getExceptionCta(10)).toBe('Faire une exception de 10 min');
  });

  it('defines a varied pause-success message pool', () => {
    expect(PAUSE_SUCCESS_MESSAGES).toHaveLength(6);
    expect(PAUSE_SUCCESS_MESSAGES).toContain('Bravo, une étape de plus vers un changement.');
    expect(PAUSE_SUCCESS_MESSAGES).toContain('Tu viens de reprendre un peu la main sur cette habitude.');
  });

  it('selects pause-success messages predictably with fallback', () => {
    expect(getPauseSuccessMessage(0)).toBe(PAUSE_SUCCESS_MESSAGES[0]);
    expect(getPauseSuccessMessage(6)).toBe(PAUSE_SUCCESS_MESSAGES[0]);
    expect(getPauseSuccessMessage(-1)).toBe(PAUSE_SUCCESS_MESSAGES[0]);
    expect(getPauseSuccessMessage()).toBe(PAUSE_SUCCESS_MESSAGES[0]);
  });

  it('supports injected random selection for pause-success messages', () => {
    expect(getRandomPauseSuccessMessage(() => 0)).toBe(PAUSE_SUCCESS_MESSAGES[0]);
    expect(getRandomPauseSuccessMessage(() => 0.999)).toBe(PAUSE_SUCCESS_MESSAGES[PAUSE_SUCCESS_MESSAGES.length - 1]);
  });
});
