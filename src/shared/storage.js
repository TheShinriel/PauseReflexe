import { browserApi } from './browser-api.js';

const LOCAL_DEFAULTS = { blockedDomains: [] };
const SESSION_DEFAULTS = { paused: false, allowedUntilByDomain: {} };

export async function getLocalState() {
  return { ...LOCAL_DEFAULTS, ...(await browserApi.storage.local.get(LOCAL_DEFAULTS)) };
}

export async function setBlockedDomains(blockedDomains) {
  const unique = [...new Set(blockedDomains)].sort();
  await browserApi.storage.local.set({ blockedDomains: unique });
  return unique;
}

export async function addBlockedDomain(domain) {
  const state = await getLocalState();
  return setBlockedDomains([...state.blockedDomains, domain]);
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
  await setSessionState({ allowedUntilByDomain });
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
