import { describe, expect, it } from 'vitest';
import { buildRedirectRule, BLOCK_RULE_ID_BASE } from '../src/shared/rules.js';

describe('buildRedirectRule', () => {
  it('creates a main-frame redirect rule for a domain and its subdomains', () => {
    const rule = buildRedirectRule({
      domain: 'example.com',
      index: 0,
      blockedPageUrl: 'chrome-extension://test/blocked/blocked.html',
    });

    expect(rule.id).toBe(BLOCK_RULE_ID_BASE);
    expect(rule.action.type).toBe('redirect');
    expect(rule.action.redirect.regexSubstitution).toContain('/blocked/blocked.html');
    expect(rule.action.redirect.regexSubstitution).toContain('domain=example.com');
    expect(rule.condition.regexFilter).toBe('^https?://([^/]+\\.)?example\\.com(:[0-9]+)?(/.*)?$');
    expect(rule.condition.resourceTypes).toEqual(['main_frame']);
  });
});
