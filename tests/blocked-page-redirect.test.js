import { describe, expect, it } from 'vitest';
import { shouldRedirectFromBlockedPage } from '../src/shared/blocked-page-redirect.js';

const originalUrl = 'https://example.com/watch?v=123';

describe('blocked page redirect decision', () => {
  it('does not redirect while the domain is still actively blocked', () => {
    expect(shouldRedirectFromBlockedPage({
      domain: 'example.com',
      originalUrl,
      blockedDomains: ['example.com'],
      allowedUntilByDomain: {},
      paused: false,
      now: 1000,
    })).toBe(false);
  });

  it('redirects when the blocked domain has an active temporary exception', () => {
    expect(shouldRedirectFromBlockedPage({
      domain: 'example.com',
      originalUrl,
      blockedDomains: ['example.com'],
      allowedUntilByDomain: { 'example.com': 2000 },
      paused: false,
      now: 1000,
    })).toBe(true);
  });

  it('does not redirect for expired temporary exceptions', () => {
    expect(shouldRedirectFromBlockedPage({
      domain: 'example.com',
      originalUrl,
      blockedDomains: ['example.com'],
      allowedUntilByDomain: { 'example.com': 1000 },
      paused: false,
      now: 1000,
    })).toBe(false);
  });

  it('redirects when the block has been removed completely', () => {
    expect(shouldRedirectFromBlockedPage({
      domain: 'example.com',
      originalUrl,
      blockedDomains: ['other.com'],
      allowedUntilByDomain: {},
      paused: false,
      now: 1000,
    })).toBe(true);
  });

  it('redirects while global pause is enabled', () => {
    expect(shouldRedirectFromBlockedPage({
      domain: 'example.com',
      originalUrl,
      blockedDomains: ['example.com'],
      allowedUntilByDomain: {},
      paused: true,
      now: 1000,
    })).toBe(true);
  });

  it('does not redirect without enough querystring context', () => {
    expect(shouldRedirectFromBlockedPage({
      domain: null,
      originalUrl,
      blockedDomains: [],
    })).toBe(false);

    expect(shouldRedirectFromBlockedPage({
      domain: 'example.com',
      originalUrl: null,
      blockedDomains: [],
    })).toBe(false);
  });
});
