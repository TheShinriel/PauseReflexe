import { describe, expect, it, vi } from 'vitest';
import { handleRuntimeMessage } from '../src/background/messages.js';

function dependencies(overrides = {}) {
  return {
    addBlockedDomain: vi.fn(),
    allowDomainTemporarily: vi.fn(),
    extendTemporaryAllow: vi.fn(),
    getLocalState: vi.fn(),
    getSessionState: vi.fn(),
    rebuildRules: vi.fn().mockResolvedValue(undefined),
    removeBlockedDomain: vi.fn(),
    removeTemporaryAllow: vi.fn(),
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

  it('returns temporary exception state to content scripts through GET_STATE', async () => {
    const deps = dependencies({
      getLocalState: vi.fn().mockResolvedValue({ blockedDomains: ['example.com'], addedAtByDomain: { 'example.com': 1000 } }),
      getSessionState: vi.fn().mockResolvedValue({ paused: false, allowedUntilByDomain: { 'example.com': 2000 }, allowedDurationByDomain: { 'example.com': 10 } }),
    });

    const response = await handleRuntimeMessage({ type: 'GET_STATE' }, deps);

    expect(response).toEqual({
      ok: true,
      blockedDomains: ['example.com'],
      addedAtByDomain: { 'example.com': 1000 },
      paused: false,
      allowedUntilByDomain: { 'example.com': 2000 },
      allowedDurationByDomain: { 'example.com': 10 },
    });
  });

  it('schedules a quick rules rebuild for sub-minute temporary exceptions', async () => {
    const allowDomainTemporarily = vi.fn().mockResolvedValue(undefined);
    const rebuildRules = vi.fn().mockResolvedValue(undefined);
    const scheduleRebuildRules = vi.fn();
    const deps = dependencies({ allowDomainTemporarily, rebuildRules, scheduleRebuildRules });

    const response = await handleRuntimeMessage(
      { type: 'ALLOW_TEMPORARILY', domain: 'example.com', minutes: 2 / 60 },
      deps,
    );

    expect(response).toEqual({ ok: true });
    expect(allowDomainTemporarily).toHaveBeenCalledWith('example.com', 2 / 60);
    expect(rebuildRules).toHaveBeenCalledOnce();
    expect(scheduleRebuildRules).toHaveBeenCalledWith(2100);
  });

  it('extends a temporary exception using its original duration', async () => {
    const extendTemporaryAllow = vi.fn().mockResolvedValue({ ok: true, minutes: 2 / 60 });
    const rebuildRules = vi.fn().mockResolvedValue(undefined);
    const scheduleRebuildRules = vi.fn();
    const deps = dependencies({ extendTemporaryAllow, rebuildRules, scheduleRebuildRules });

    const response = await handleRuntimeMessage(
      { type: 'EXTEND_TEMPORARY_ALLOW', domain: 'example.com' },
      deps,
    );

    expect(response).toEqual({ ok: true, minutes: 2 / 60 });
    expect(extendTemporaryAllow).toHaveBeenCalledWith('example.com');
    expect(rebuildRules).toHaveBeenCalledOnce();
    expect(scheduleRebuildRules).toHaveBeenCalledWith(2100);
  });

  it('does not rebuild rules when extending a temporary exception fails', async () => {
    const extendTemporaryAllow = vi.fn().mockResolvedValue({ ok: false, error: 'Durée temporaire introuvable.' });
    const rebuildRules = vi.fn().mockResolvedValue(undefined);
    const deps = dependencies({ extendTemporaryAllow, rebuildRules });

    const response = await handleRuntimeMessage(
      { type: 'EXTEND_TEMPORARY_ALLOW', domain: 'example.com' },
      deps,
    );

    expect(response).toEqual({ ok: false, error: 'Durée temporaire introuvable.' });
    expect(rebuildRules).not.toHaveBeenCalled();
  });

  it('removes a temporary exception to reactivate the pause immediately', async () => {
    const removeTemporaryAllow = vi.fn().mockResolvedValue(undefined);
    const rebuildRules = vi.fn().mockResolvedValue(undefined);
    const deps = dependencies({ removeTemporaryAllow, rebuildRules });

    const response = await handleRuntimeMessage(
      { type: 'REMOVE_TEMPORARY_ALLOW', domain: 'example.com' },
      deps,
    );

    expect(response).toEqual({ ok: true });
    expect(removeTemporaryAllow).toHaveBeenCalledWith('example.com');
    expect(rebuildRules).toHaveBeenCalledOnce();
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
