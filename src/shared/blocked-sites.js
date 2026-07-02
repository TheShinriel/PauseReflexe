export function buildBlockedSiteList({ blockedDomains, addedAtByDomain = {}, currentDomain = null, sortMode = 'alphabetical' }) {
  const current = currentDomain && blockedDomains.includes(currentDomain) ? currentDomain : null;

  const items = blockedDomains.map((domain) => ({
    domain,
    addedAt: addedAtByDomain[domain] ?? 0,
    isCurrent: domain === current,
  }));

  return items.sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;

    if (sortMode === 'addedAtDesc') {
      return b.addedAt - a.addedAt || a.domain.localeCompare(b.domain);
    }

    return a.domain.localeCompare(b.domain);
  });
}
