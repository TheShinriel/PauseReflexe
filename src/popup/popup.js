import { buildBlockedSiteList } from '../shared/blocked-sites.js';
import { debug } from '../shared/debug.js';
import { normalizeSiteDomain } from '../shared/domain.js';

const domainEl = document.querySelector('#domain');
const blockButton = document.querySelector('#blockButton');
const pauseSwitch = document.querySelector('#pauseSwitch');
const statusEl = document.querySelector('#status');
const sortModeEl = document.querySelector('#sortMode');
const blockedSitesListEl = document.querySelector('#blockedSitesList');

let currentDomain = null;
let lastState = { blockedDomains: [], addedAtByDomain: {} };

function setStatus(message) {
  statusEl.textContent = message;
}

async function sendMessage(message) {
  debug('popup:send-message', { type: message.type, domain: message.domain, paused: message.paused, minutes: message.minutes });
  const response = await chrome.runtime.sendMessage(message);
  debug('popup:receive-message', { type: message.type, ok: response?.ok, error: response?.error });
  return response;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function renderBlockedSites() {
  const items = buildBlockedSiteList({
    blockedDomains: lastState.blockedDomains,
    addedAtByDomain: lastState.addedAtByDomain,
    currentDomain,
    sortMode: sortModeEl.value,
  });

  debug('popup:render-blocked-sites', { count: items.length, currentDomain, sortMode: sortModeEl.value });

  blockedSitesListEl.replaceChildren();

  if (items.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'Aucun site bloqué.';
    blockedSitesListEl.append(empty);
    return;
  }

  for (const item of items) {
    const li = document.createElement('li');
    if (item.isCurrent) li.classList.add('current');

    const name = document.createElement('span');
    name.textContent = item.isCurrent ? `${item.domain} (site courant)` : item.domain;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary danger';
    button.textContent = 'Débloquer';
    button.addEventListener('click', async () => {
      debug('popup:unblock-click', { domain: item.domain, isCurrent: item.isCurrent });
      const response = await sendMessage({ type: 'UNBLOCK_DOMAIN', domain: item.domain });
      setStatus(response.ok ? `${item.domain} est débloqué.` : response.error);
      await refreshState();
    });

    li.append(name, button);
    blockedSitesListEl.append(li);
  }
}

async function refreshState() {
  debug('popup:refresh-state:start');
  const state = await sendMessage({ type: 'GET_STATE' });
  lastState = state;
  pauseSwitch.checked = Boolean(state.paused);
  debug('popup:refresh-state:done', {
    blockedCount: state.blockedDomains?.length ?? 0,
    paused: state.paused,
  });
  renderBlockedSites();
}

async function init() {
  debug('popup:init:start');
  const tab = await getActiveTab();
  debug('popup:active-tab', { url: tab?.url });
  try {
    currentDomain = normalizeSiteDomain(tab.url);
    domainEl.textContent = currentDomain;
    blockButton.disabled = false;
    debug('popup:current-domain:resolved', { currentDomain });
  } catch (error) {
    domainEl.textContent = 'Page non compatible';
    blockButton.disabled = true;
    debug('popup:current-domain:unsupported', { url: tab?.url, error: error.message });
  }

  await refreshState();
  debug('popup:init:done');
}

blockButton.addEventListener('click', async () => {
  if (!currentDomain) return;
  debug('popup:block-click', { currentDomain });
  blockButton.disabled = true;
  const response = await sendMessage({ type: 'BLOCK_DOMAIN', domain: currentDomain });
  setStatus(response.ok ? `${currentDomain} est bloqué.` : response.error);
  await refreshState();
  blockButton.disabled = false;
});

pauseSwitch.addEventListener('change', async () => {
  debug('popup:pause-change', { paused: pauseSwitch.checked });
  const response = await sendMessage({ type: 'SET_PAUSED', paused: pauseSwitch.checked });
  setStatus(response.ok ? 'Préférence de session mise à jour.' : response.error);
  await refreshState();
});

sortModeEl.addEventListener('change', () => {
  debug('popup:sort-change', { sortMode: sortModeEl.value });
  renderBlockedSites();
});

init().catch((error) => {
  debug('popup:init:error', { error: error.message });
  setStatus(error.message);
});
