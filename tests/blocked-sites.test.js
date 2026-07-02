import { describe, expect, it } from 'vitest';
import { buildBlockedSiteList } from '../src/shared/blocked-sites.js';

describe('buildBlockedSiteList', () => {
  const addedAtByDomain = {
    'zeta.com': 300,
    'current.com': 200,
    'alpha.com': 100,
  };

  it('pins the current blocked domain first', () => {
    const list = buildBlockedSiteList({
      blockedDomains: ['zeta.com', 'current.com', 'alpha.com'],
      addedAtByDomain,
      currentDomain: 'current.com',
    });

    expect(list.map((item) => item.domain)).toEqual(['current.com', 'alpha.com', 'zeta.com']);
  });

  it('sorts alphabetically by default when current domain is not blocked', () => {
    const list = buildBlockedSiteList({
      blockedDomains: ['zeta.com', 'alpha.com'],
      addedAtByDomain,
      currentDomain: 'other.com',
    });

    expect(list.map((item) => item.domain)).toEqual(['alpha.com', 'zeta.com']);
  });

  it('can sort by added date descending', () => {
    const list = buildBlockedSiteList({
      blockedDomains: ['zeta.com', 'alpha.com', 'current.com'],
      addedAtByDomain,
      sortMode: 'addedAtDesc',
    });

    expect(list.map((item) => item.domain)).toEqual(['zeta.com', 'current.com', 'alpha.com']);
  });
});
