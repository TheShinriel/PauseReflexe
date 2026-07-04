export function shouldRedirectFromBlockedPage({ domain, originalUrl, blockedDomains = [], allowedUntilByDomain = {}, paused = false, now = Date.now() }) {
  if (!domain || !originalUrl) return false;
  if (paused) return true;
  if (!blockedDomains.includes(domain)) return true;

  const allowedUntil = Number(allowedUntilByDomain[domain]);
  return Number.isFinite(allowedUntil) && allowedUntil > now;
}
