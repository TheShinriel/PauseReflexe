import { handleRuntimeMessage } from './messages.js';
import { debug } from '../shared/debug.js';
import { buildRules, ALLOW_RULE_ID_BASE, BLOCK_RULE_ID_BASE } from '../shared/rules.js';
import { addBlockedDomain, allowDomainTemporarily, extendTemporaryAllow, getActiveAllowedDomains, getLocalState, getSessionState, removeBlockedDomain, removeTemporaryAllow, setPaused } from '../shared/storage.js';

const MAX_RULES_TO_CLEAR = 5000;

async function clearManagedRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing
    .map((rule) => rule.id)
    .filter((id) => (id >= BLOCK_RULE_ID_BASE && id < BLOCK_RULE_ID_BASE + MAX_RULES_TO_CLEAR)
      || (id >= ALLOW_RULE_ID_BASE && id < ALLOW_RULE_ID_BASE + MAX_RULES_TO_CLEAR));

  debug('dnr:clear-managed-rules', { existingCount: existing.length, removeCount: removeRuleIds.length });

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

  debug('dnr:rebuild:start', {
    blockedCount: local.blockedDomains.length,
    allowedCount: allowedDomains.length,
    paused: session.paused,
    addRuleCount: addRules.length,
  });

  await clearManagedRules();
  if (addRules.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({ addRules });
  }

  debug('dnr:rebuild:done', { addRuleCount: addRules.length });
}

const messageDependencies = {
  addBlockedDomain,
  allowDomainTemporarily,
  extendTemporaryAllow,
  getLocalState,
  getSessionState,
  rebuildRules,
  removeBlockedDomain,
  removeTemporaryAllow,
  scheduleRebuildRules: (delayMs) => setTimeout(rebuildRules, delayMs),
  setPaused,
  closeTab: (tabId) => chrome.tabs.remove(tabId),
  debug,
};

chrome.runtime.onInstalled.addListener(() => {
  debug('lifecycle:on-installed');
  rebuildRules();
});

chrome.runtime.onStartup.addListener(() => {
  debug('lifecycle:on-startup');
  setPaused(false).then(rebuildRules);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleRuntimeMessage(message, messageDependencies, sender)
    .then(sendResponse)
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});

setInterval(rebuildRules, 60 * 1000);
