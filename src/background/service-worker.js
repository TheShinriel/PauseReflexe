import { buildRules, ALLOW_RULE_ID_BASE, BLOCK_RULE_ID_BASE } from '../shared/rules.js';
import { addBlockedDomain, allowDomainTemporarily, getActiveAllowedDomains, getLocalState, getSessionState, removeBlockedDomain, setPaused } from '../shared/storage.js';
import { handleRuntimeMessage } from './messages.js';

const MAX_RULES_TO_CLEAR = 5000;

async function clearManagedRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing
    .map((rule) => rule.id)
    .filter((id) => (id >= BLOCK_RULE_ID_BASE && id < BLOCK_RULE_ID_BASE + MAX_RULES_TO_CLEAR)
      || (id >= ALLOW_RULE_ID_BASE && id < ALLOW_RULE_ID_BASE + MAX_RULES_TO_CLEAR));

  if (removeRuleIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
  }
}

export async function rebuildRules() {
  const local = await getLocalState();
  const session = await getSessionState();
  const allowedDomains = await getActiveAllowedDomains();
  const addRules = buildRules({
    blockedDomains: local.blockedDomains,
    allowedDomains,
    paused: session.paused,
    blockedPageUrl: chrome.runtime.getURL('/blocked/blocked.html'),
  });

  await clearManagedRules();
  if (addRules.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({ addRules });
  }
}

const messageDependencies = {
  addBlockedDomain,
  allowDomainTemporarily,
  getLocalState,
  getSessionState,
  rebuildRules,
  removeBlockedDomain,
  setPaused,
};

chrome.runtime.onInstalled.addListener(() => {
  rebuildRules();
});

chrome.runtime.onStartup.addListener(() => {
  setPaused(false).then(rebuildRules);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleRuntimeMessage(message, messageDependencies)
    .then(sendResponse)
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});

setInterval(rebuildRules, 60 * 1000);
