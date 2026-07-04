import { browserApi } from './browser-api.js';

const LOCAL_DEFAULTS = { blockedDomains: [], addedAtByDomain: {} };
const SESSION_DEFAULTS = { paused: false, allowedUntilByDomain: {}, allowedDurationByDomain: {} };

export async function getLocalState() {
  return { ...LOCAL_DEFAULTS, ...(await browserApi.storage.local.get(LOCAL_DEFAULTS)) };
}

export async function setBlockedDomains(blockedDomains, existingAddedAtByDomain = {}) {
  const unique = [...new Set(blockedDomains)].sort();
  const now = Date.now();
  const addedAtByDomain = Object.fromEntries(
    unique.map((domain) => [domain, existingAddedAtByDomain[domain] ?? now]),
  );

  await browserApi.storage.local.set({ blockedDomains: unique, addedAtByDomain });
  return unique;
}

export async function addBlockedDomain(domain) {
  const state = await getLocalState();
  return setBlockedDomains([...state.blockedDomains, domain], state.addedAtByDomain);
}

export async function removeBlockedDomain(domain) {
  const state = await getLocalState();
  const blockedDomains = state.blockedDomains.filter((blockedDomain) => blockedDomain !== domain);
  const { [domain]: _removed, ...addedAtByDomain } = state.addedAtByDomain;
  await browserApi.storage.local.set({ blockedDomains, addedAtByDomain });
  return blockedDomains;
}

export async function getSessionState() {
  const storage = browserApi.storage.session ?? browserApi.storage.local;
  return { ...SESSION_DEFAULTS, ...(await storage.get(SESSION_DEFAULTS)) };
}

export async function setSessionState(patch) {
  const storage = browserApi.storage.session ?? browserApi.storage.local;
  await storage.set(patch);
}

export async function setPaused(paused) {
  await setSessionState({ paused });
}

export async function allowDomainTemporarily(domain, minutes) {
  const state = await getSessionState();
  const allowedUntilByDomain = {
    ...state.allowedUntilByDomain,
    [domain]: Date.now() + minutes * 60 * 1000,
  };
  const allowedDurationByDomain = {
    ...state.allowedDurationByDomain,
    [domain]: minutes,
  };
  await setSessionState({ allowedUntilByDomain, allowedDurationByDomain });
}

export async function extendTemporaryAllow(domain) {
  const state = await getSessionState();
  const minutes = Number(state.allowedDurationByDomain[domain]);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return { ok: false, error: 'Durée temporaire introuvable.' };
  }

  await allowDomainTemporarily(domain, minutes);
  return { ok: true, minutes };
}

export async function removeTemporaryAllow(domain) {
  const state = await getSessionState();
  const { [domain]: _untilRemoved, ...allowedUntilByDomain } = state.allowedUntilByDomain;
  const { [domain]: _durationRemoved, ...allowedDurationByDomain } = state.allowedDurationByDomain;
  await setSessionState({ allowedUntilByDomain, allowedDurationByDomain });
}

export async function getActiveAllowedDomains() {
  const state = await getSessionState();
  const now = Date.now();
  const active = Object.entries(state.allowedUntilByDomain)
    .filter(([, until]) => until > now)
    .map(([domain]) => domain);

  const cleaned = Object.fromEntries(
    Object.entries(state.allowedUntilByDomain).filter(([, until]) => until > now),
  );

  if (Object.keys(cleaned).length !== Object.keys(state.allowedUntilByDomain).length) {
    await setSessionState({ allowedUntilByDomain: cleaned });
  }

  return active;
}
