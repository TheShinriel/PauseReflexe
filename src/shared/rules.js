export const BLOCK_RULE_ID_BASE = 1000;
export const ALLOW_RULE_ID_BASE = 100000;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildDomainRegex(domain) {
  const escaped = escapeRegex(domain);
  return `^https?://([^/]+\\.)?${escaped}(:[0-9]+)?(/.*)?$`;
}

export function buildRedirectRule({ domain, index, blockedPageUrl }) {
  return {
    id: BLOCK_RULE_ID_BASE + index,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        regexSubstitution: `${blockedPageUrl}?domain=${encodeURIComponent(domain)}&url=\\0`,
      },
    },
    condition: {
      regexFilter: buildDomainRegex(domain),
      resourceTypes: ['main_frame'],
    },
  };
}

export function buildAllowRule({ domain, index }) {
  return {
    id: ALLOW_RULE_ID_BASE + index,
    priority: 10,
    action: { type: 'allow' },
    condition: {
      regexFilter: buildDomainRegex(domain),
      resourceTypes: ['main_frame'],
    },
  };
}

export function buildRules({ blockedDomains, allowedDomains = [], paused = false, blockedPageUrl }) {
  if (paused) return [];

  const allowRules = allowedDomains.map((domain, index) => buildAllowRule({ domain, index }));
  const blockRules = blockedDomains.map((domain, index) => buildRedirectRule({ domain, index, blockedPageUrl }));

  return [...allowRules, ...blockRules];
}
