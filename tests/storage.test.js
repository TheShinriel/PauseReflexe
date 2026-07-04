import { beforeEach, describe, expect, it, vi } from 'vitest';

function createFakeStorage(initialState = {}) {
  const state = { ...initialState };
  return {
    get: vi.fn(async (defaults) => ({ ...defaults, ...state })),
    set: vi.fn(async (patch) => {
      Object.assign(state, patch);
    }),
    state,
  };
}

async function importStorageWithFakeSession(initialState = {}) {
  vi.resetModules();
  const session = createFakeStorage(initialState);
  const local = createFakeStorage();
  globalThis.chrome = { storage: { local, session } };
  const storage = await import('../src/shared/storage.js');
  return { storage, session, local };
}

describe('temporary allow storage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete globalThis.chrome;
    delete globalThis.browser;
  });

  it('stores both the temporary allow expiry and the original duration', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    const { storage, session } = await importStorageWithFakeSession();

    await storage.allowDomainTemporarily('example.com', 15);

    expect(session.state.allowedUntilByDomain).toEqual({ 'example.com': 901000 });
    expect(session.state.allowedDurationByDomain).toEqual({ 'example.com': 15 });
  });

  it('extends a temporary allow using the stored original duration', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(2000);
    const { storage, session } = await importStorageWithFakeSession({
      allowedUntilByDomain: { 'example.com': 1000 },
      allowedDurationByDomain: { 'example.com': 5 },
    });

    const result = await storage.extendTemporaryAllow('example.com');

    expect(result).toEqual({ ok: true, minutes: 5 });
    expect(session.state.allowedUntilByDomain).toEqual({ 'example.com': 302000 });
    expect(session.state.allowedDurationByDomain).toEqual({ 'example.com': 5 });
  });

  it('returns an error when extending without a stored duration', async () => {
    const { storage, session } = await importStorageWithFakeSession({
      allowedUntilByDomain: { 'example.com': 1000 },
      allowedDurationByDomain: {},
    });

    const result = await storage.extendTemporaryAllow('example.com');

    expect(result).toEqual({ ok: false, error: 'Durée temporaire introuvable.' });
    expect(session.set).not.toHaveBeenCalled();
  });

  it('removes temporary allow expiry and duration when the pause is reactivated', async () => {
    const { storage, session } = await importStorageWithFakeSession({
      allowedUntilByDomain: { 'example.com': 1000, 'other.com': 2000 },
      allowedDurationByDomain: { 'example.com': 5, 'other.com': 10 },
    });

    await storage.removeTemporaryAllow('example.com');

    expect(session.state.allowedUntilByDomain).toEqual({ 'other.com': 2000 });
    expect(session.state.allowedDurationByDomain).toEqual({ 'other.com': 10 });
  });

  it('keeps the original duration after an expired allow is cleaned', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(2000);
    const { storage, session } = await importStorageWithFakeSession({
      allowedUntilByDomain: { 'example.com': 1000 },
      allowedDurationByDomain: { 'example.com': 5 },
    });

    const active = await storage.getActiveAllowedDomains();

    expect(active).toEqual([]);
    expect(session.state.allowedUntilByDomain).toEqual({});
    expect(session.state.allowedDurationByDomain).toEqual({ 'example.com': 5 });
  });
});
