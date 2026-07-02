import { describe, expect, it } from 'vitest';
import { normalizeSiteDomain } from '../src/shared/domain.js';

describe('normalizeSiteDomain', () => {
  it('normalizes a regular URL to its registrable domain', () => {
    expect(normalizeSiteDomain('https://www.example.com/path')).toBe('example.com');
  });

  it('keeps meaningful subdomain when public suffix would otherwise be wrong without PSL', () => {
    expect(normalizeSiteDomain('https://news.ycombinator.com/item?id=1')).toBe('ycombinator.com');
  });

  it('handles common multi-part public suffixes', () => {
    expect(normalizeSiteDomain('https://www.bbc.co.uk/news')).toBe('bbc.co.uk');
  });

  it('rejects unsupported URLs', () => {
    expect(() => normalizeSiteDomain('chrome://extensions')).toThrow(/Unsupported URL/);
  });
});
