import { buildBlockedSiteList } from '../shared/blocked-sites.js';
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
  return chrome.runtime.sendMessage(message);
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
      const response = await sendMessage({ type: 'UNBLOCK_DOMAIN', domain: item.domain });
      setStatus(response.ok ? `${item.domain} est débloqué.` : response.error);
      await refreshState();
    });

    li.append(name, button);
    blockedSitesListEl.append(li);
  }
}

async function refreshState() {
  const state = await sendMessage({ type: 'GET_STATE' });
  lastState = state;
  pauseSwitch.checked = Boolean(state.paused);
  renderBlockedSites();
}

async function init() {
  const tab = await getActiveTab();
  try {
    currentDomain = normalizeSiteDomain(tab.url);
    domainEl.textContent = currentDomain;
    blockButton.disabled = false;
  } catch {
    domainEl.textContent = 'Page non compatible';
    blockButton.disabled = true;
  }

  await refreshState();
}

blockButton.addEventListener('click', async () => {
  if (!currentDomain) return;
  blockButton.disabled = true;
  const response = await sendMessage({ type: 'BLOCK_DOMAIN', domain: currentDomain });
  setStatus(response.ok ? `${currentDomain} est bloqué.` : response.error);
  await refreshState();
  blockButton.disabled = false;
});

pauseSwitch.addEventListener('change', async () => {
  const response = await sendMessage({ type: 'SET_PAUSED', paused: pauseSwitch.checked });
  setStatus(response.ok ? 'Préférence de session mise à jour.' : response.error);
  await refreshState();
});

sortModeEl.addEventListener('change', renderBlockedSites);

init().catch((error) => setStatus(error.message));
