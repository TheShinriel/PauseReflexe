import { buildBlockedSiteList } from '../shared/blocked-sites.js';
import { debug } from '../shared/debug.js';
import { normalizeSiteDomain } from '../shared/domain.js';
import { requiresPauseConfirmation } from '../shared/pause-confirmation.js';

const domainEl = document.querySelector('#domain');
const blockButton = document.querySelector('#blockButton');
const pauseSwitch = document.querySelector('#pauseSwitch');
const statusEl = document.querySelector('#status');
const sortModeEl = document.querySelector('#sortMode');
const blockedSitesListEl = document.querySelector('#blockedSitesList');
const globalStatusEl = document.querySelector('#globalStatus');
const domainStatusEl = document.querySelector('#domainStatus');
const blockedCountEl = document.querySelector('#blockedCount');
const temporaryAllowBannerEl = document.querySelector('#temporaryAllowBanner');
const temporaryAllowRemainingEl = document.querySelector('#temporaryAllowRemaining');
const resumePauseButton = document.querySelector('#resumePauseButton');

let currentDomain = null;
let activeTabId = null;
let lastState = { blockedDomains: [], addedAtByDomain: {} };
let timerIntervalId = null;

function setStatus(message) {
  statusEl.textContent = message;
}

function setPill(el, label, variant) {
  el.textContent = label;
  el.className = `status-pill ${variant}`;
}

async function replaceActiveTabWithPauseSuccess() {
  if (!Number.isInteger(activeTabId) || !currentDomain) {
    debug('popup:pause-success-tab-replace-skipped', { activeTabId, currentDomain });
    return;
  }

  const url = chrome.runtime.getURL(`/paused/paused.html?domain=${encodeURIComponent(currentDomain)}`);
  debug('popup:pause-success-tab-replace', { activeTabId, currentDomain, url });
  await chrome.tabs.update(activeTabId, { url });
}

function currentDomainIsBlocked() {
  return Boolean(currentDomain && lastState.blockedDomains?.includes(currentDomain));
}

function getCurrentTemporaryAllowUntil(now = Date.now()) {
  if (!currentDomain || !currentDomainIsBlocked()) return null;
  const until = Number(lastState.allowedUntilByDomain?.[currentDomain]);
  return Number.isFinite(until) && until > now ? until : null;
}

function formatRemainingTime(until, now = Date.now()) {
  const remainingSeconds = Math.max(0, Math.ceil((until - now) / 1000));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function renderTemporaryAllowBanner() {
  const until = getCurrentTemporaryAllowUntil();
  temporaryAllowBannerEl.hidden = !until;

  if (!until) {
    if (timerIntervalId !== null) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }
    return;
  }

  temporaryAllowRemainingEl.textContent = formatRemainingTime(until);
  if (timerIntervalId === null) {
    timerIntervalId = setInterval(renderTemporaryAllowBanner, 1000);
  }
}

function renderStateBadges() {
  if (lastState.paused) {
    setPill(globalStatusEl, 'En pause', 'paused');
  } else {
    setPill(globalStatusEl, 'Actif', 'active');
  }

  if (!currentDomain) {
    setPill(domainStatusEl, 'Non compatible', 'warning');
    blockButton.textContent = 'Page non compatible';
    blockButton.disabled = true;
    return;
  }

  if (currentDomainIsBlocked()) {
    setPill(domainStatusEl, 'En pause', 'blocked');
    blockButton.textContent = 'Déjà en pause';
    blockButton.disabled = true;
    return;
  }

  setPill(domainStatusEl, 'Pas en pause', 'safe');
  blockButton.textContent = 'Mettre ce site en pause';
  blockButton.disabled = false;
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

  blockedCountEl.textContent = String(items.length);
  debug('popup:render-blocked-sites', { count: items.length, currentDomain, sortMode: sortModeEl.value });

  blockedSitesListEl.replaceChildren();

  if (items.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'Aucun site en pause pour le moment.';
    blockedSitesListEl.append(empty);
    return;
  }

  for (const item of items) {
    const li = document.createElement('li');
    if (item.isCurrent) li.classList.add('current');

    const name = document.createElement('div');
    name.className = 'site-name';

    const domain = document.createElement('span');
    domain.className = 'site-domain';
    domain.textContent = item.domain;

    const meta = document.createElement('span');
    meta.className = 'site-meta';
    meta.textContent = item.isCurrent ? 'Site actuel' : 'Pause active';

    name.append(domain, meta);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button-danger-soft';
    button.textContent = 'Retirer';
    button.addEventListener('click', async () => {
      debug('popup:unblock-click', { domain: item.domain, isCurrent: item.isCurrent });
      button.disabled = true;
      const response = await sendMessage({ type: 'UNBLOCK_DOMAIN', domain: item.domain });
      setStatus(response.ok ? `${item.domain} n’est plus en pause.` : response.error);
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
  renderStateBadges();
  renderTemporaryAllowBanner();
  renderBlockedSites();
}

async function init() {
  debug('popup:init:start');
  const tab = await getActiveTab();
  activeTabId = tab?.id;
  debug('popup:active-tab', { url: tab?.url });
  try {
    currentDomain = normalizeSiteDomain(tab.url);
    domainEl.textContent = currentDomain;
    debug('popup:current-domain:resolved', { currentDomain });
  } catch (error) {
    currentDomain = null;
    domainEl.textContent = 'Page non compatible';
    debug('popup:current-domain:unsupported', { url: tab?.url, error: error.message });
  }

  await refreshState();
  debug('popup:init:done');
}

blockButton.addEventListener('click', async () => {
  if (!currentDomain || currentDomainIsBlocked()) return;
  debug('popup:block-click', { currentDomain });
  blockButton.disabled = true;
  const response = await sendMessage({ type: 'BLOCK_DOMAIN', domain: currentDomain });
  setStatus(response.ok ? '' : response.error);
  await refreshState();
  if (response.ok) {
    await replaceActiveTabWithPauseSuccess();
  }
});

resumePauseButton.addEventListener('click', async () => {
  if (!currentDomain) return;
  debug('popup:resume-pause-click', { currentDomain });
  resumePauseButton.disabled = true;
  const response = await sendMessage({ type: 'REMOVE_TEMPORARY_ALLOW', domain: currentDomain });
  setStatus(response.ok ? 'La pause est réactivée sur ce site.' : response.error);
  await refreshState();
  if (response.ok && Number.isInteger(activeTabId)) {
    await chrome.tabs.reload(activeTabId);
  }
  resumePauseButton.disabled = false;
});

pauseSwitch.addEventListener('change', async () => {
  const nextPaused = pauseSwitch.checked;
  const currentPaused = Boolean(lastState.paused);
  debug('popup:pause-change', { paused: nextPaused, currentPaused });

  if (requiresPauseConfirmation({ currentPaused, nextPaused })) {
    const confirmed = window.confirm('Tu vas désactiver tes pauses jusqu’à la fermeture du navigateur. C’est bien volontaire ?');
    debug('popup:pause-confirmation', { confirmed });
    if (!confirmed) {
      pauseSwitch.checked = currentPaused;
      setStatus('Les pauses restent actives.');
      return;
    }
  }

  const response = await sendMessage({ type: 'SET_PAUSED', paused: nextPaused });
  setStatus(response.ok ? (nextPaused ? 'Pauses désactivées pour cette session.' : 'Pauses réactivées.') : response.error);
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
