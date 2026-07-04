import { getExceptionCta, getRandomBlockedPageMessage } from '../shared/copy.js';
import { debug } from '../shared/debug.js';
import { clampDuration, getDefaultDuration, getDurationLabel } from '../shared/durations.js';

const domainEl = document.querySelector('#domain');
const blockedMessageEl = document.querySelector('#blockedMessage');
const durationLabel = document.querySelector('#durationLabel');
const durationSlider = document.querySelector('#durationSlider');
const continueButton = document.querySelector('#continueButton');
const debugTwoSecondButton = document.querySelector('#debugTwoSecondButton');
const statusEl = document.querySelector('#status');

const params = new URLSearchParams(window.location.search);
const domain = params.get('domain');
const originalUrl = extractOriginalUrl();
let selectedDuration = getDefaultDuration();

domainEl.textContent = domain || 'ce site';
blockedMessageEl.textContent = getRandomBlockedPageMessage();
debug('blocked-page:init', { domain, hasOriginalUrl: Boolean(originalUrl) });

if (isDebugBypassEnabled()) {
  debugTwoSecondButton.hidden = false;
  debug('blocked-page:debug-2s-enabled');
}

function extractOriginalUrl() {
  const marker = '&url=';
  const index = window.location.href.indexOf(marker);
  if (index === -1) return null;
  return window.location.href.slice(index + marker.length);
}

function selectedMinutes() {
  return selectedDuration;
}

function isDebugBypassEnabled() {
  return params.get('debug') === '1' || window.localStorage.getItem('pause-reflexe-debug') === 'true';
}

function updateDuration(minutes) {
  selectedDuration = clampDuration(minutes);
  durationLabel.textContent = getDurationLabel(selectedDuration);
  continueButton.textContent = getExceptionCta(selectedDuration);
  durationSlider.value = String(selectedDuration);

  debug('blocked-page:duration-change', { minutes: selectedDuration });
}

durationSlider.addEventListener('input', () => {
  updateDuration(durationSlider.value);
});

async function allowAndRedirect({ minutes, label, button, eventName }) {
  debug(eventName, { domain, hasOriginalUrl: Boolean(originalUrl), minutes });
  if (!domain || !originalUrl) {
    statusEl.textContent = 'Impossible de retrouver le site d’origine.';
    debug('blocked-page:allow-aborted', { domain, hasOriginalUrl: Boolean(originalUrl), minutes });
    return;
  }

  button.disabled = true;
  const response = await chrome.runtime.sendMessage({
    type: 'ALLOW_TEMPORARILY',
    domain,
    minutes,
  });
  debug('blocked-page:allow-response', { ok: response?.ok, error: response?.error, domain, minutes });

  if (!response.ok) {
    statusEl.textContent = response.error ?? 'L’exception temporaire n’a pas pu être créée.';
    button.disabled = false;
    return;
  }

  statusEl.textContent = `Exception active pour ${label}.`;
  debug('blocked-page:redirect-original', { originalUrl });
  window.location.replace(originalUrl);
}

continueButton.addEventListener('click', async () => {
  const minutes = selectedMinutes();
  await allowAndRedirect({
    button: continueButton,
    eventName: 'blocked-page:allow-click',
    label: getDurationLabel(minutes),
    minutes,
  });
});

debugTwoSecondButton.addEventListener('click', async () => {
  await allowAndRedirect({
    button: debugTwoSecondButton,
    eventName: 'blocked-page:debug-allow-2s-click',
    label: '2 s',
    minutes: 2 / 60,
  });
});

updateDuration(selectedDuration);
