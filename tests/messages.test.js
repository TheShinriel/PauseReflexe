import { describe, expect, it, vi } from 'vitest';
import { handleRuntimeMessage } from '../src/background/messages.js';

function dependencies(overrides = {}) {
  return {
    addBlockedDomain: vi.fn(),
    allowDomainTemporarily: vi.fn(),
    getLocalState: vi.fn(),
    getSessionState: vi.fn(),
    rebuildRules: vi.fn().mockResolvedValue(undefined),
    removeBlockedDomain: vi.fn(),
    setPaused: vi.fn(),
    closeTab: vi.fn(),
    debug: vi.fn(),
    ...overrides,
  };
}

describe('handleRuntimeMessage', () => {
  it('handles definitive domain unblock messages', async () => {
    const removeBlockedDomain = vi.fn().mockResolvedValue(['other.com']);
    const rebuildRules = vi.fn().mockResolvedValue(undefined);
    const deps = dependencies({ removeBlockedDomain, rebuildRules });

    const response = await handleRuntimeMessage(
      { type: 'UNBLOCK_DOMAIN', domain: 'example.com' },
      deps,
    );

    expect(response).toEqual({ ok: true });
    expect(removeBlockedDomain).toHaveBeenCalledWith('example.com');
    expect(rebuildRules).toHaveBeenCalledOnce();
  });

  it('logs runtime message handling for service worker debugging', async () => {
    const removeBlockedDomain = vi.fn().mockResolvedValue(['other.com']);
    const rebuildRules = vi.fn().mockResolvedValue(undefined);
    const debug = vi.fn();
    const deps = dependencies({ removeBlockedDomain, rebuildRules, debug });

    await handleRuntimeMessage(
      { type: 'UNBLOCK_DOMAIN', domain: 'example.com' },
      deps,
    );

    expect(debug).toHaveBeenCalledWith('runtime:received', expect.objectContaining({ type: 'UNBLOCK_DOMAIN', domain: 'example.com' }));
    expect(debug).toHaveBeenCalledWith('runtime:unblock-domain:start', { domain: 'example.com' });
    expect(debug).toHaveBeenCalledWith('runtime:unblock-domain:done', { domain: 'example.com' });
  });

  it('closes the sender tab from a content-script request', async () => {
    const closeTab = vi.fn().mockResolvedValue(undefined);
    const deps = dependencies({ closeTab });

    const response = await handleRuntimeMessage(
      { type: 'CLOSE_CURRENT_TAB' },
      deps,
      { tab: { id: 42 } },
    );

    expect(response).toEqual({ ok: true });
    expect(closeTab).toHaveBeenCalledWith(42);
  });

  it('rejects close-tab requests without a sender tab', async () => {
    const closeTab = vi.fn().mockResolvedValue(undefined);
    const deps = dependencies({ closeTab });

    const response = await handleRuntimeMessage(
      { type: 'CLOSE_CURRENT_TAB' },
      deps,
      {},
    );

    expect(response).toEqual({ ok: false, error: 'Impossible de fermer cet onglet.' });
    expect(closeTab).not.toHaveBeenCalled();
  });
});
