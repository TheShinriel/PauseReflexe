import { normalizeSiteDomain } from '../shared/domain.js';

const domainEl = document.querySelector('#domain');
const blockButton = document.querySelector('#blockButton');
const pauseSwitch = document.querySelector('#pauseSwitch');
const statusEl = document.querySelector('#status');

let currentDomain = null;

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

  const state = await sendMessage({ type: 'GET_STATE' });
  pauseSwitch.checked = Boolean(state.paused);
}

blockButton.addEventListener('click', async () => {
  if (!currentDomain) return;
  blockButton.disabled = true;
  const response = await sendMessage({ type: 'BLOCK_DOMAIN', domain: currentDomain });
  setStatus(response.ok ? `${currentDomain} est bloqué.` : response.error);
  blockButton.disabled = false;
});

pauseSwitch.addEventListener('change', async () => {
  const response = await sendMessage({ type: 'SET_PAUSED', paused: pauseSwitch.checked });
  setStatus(response.ok ? 'Préférence de session mise à jour.' : response.error);
});

init().catch((error) => setStatus(error.message));
