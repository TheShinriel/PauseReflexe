import { debug } from '../shared/debug.js';
import { BYPASS_DURATIONS_MINUTES, getDefaultDuration, getDurationLabel } from '../shared/durations.js';

const domainEl = document.querySelector('#domain');
const durationLabel = document.querySelector('#durationLabel');
const durationOptionsEl = document.querySelector('#durationOptions');
const continueButton = document.querySelector('#continueButton');
const statusEl = document.querySelector('#status');

const params = new URLSearchParams(window.location.search);
const domain = params.get('domain');
const originalUrl = extractOriginalUrl();
let selectedDuration = getDefaultDuration();

domainEl.textContent = domain || 'ce site';
debug('blocked-page:init', { domain, hasOriginalUrl: Boolean(originalUrl) });

function extractOriginalUrl() {
  const marker = '&url=';
  const index = window.location.href.indexOf(marker);
  if (index === -1) return null;
  return window.location.href.slice(index + marker.length);
}

function selectedMinutes() {
  return selectedDuration;
}

function updateDuration(minutes) {
  selectedDuration = BYPASS_DURATIONS_MINUTES.includes(minutes) ? minutes : getDefaultDuration();
  durationLabel.textContent = getDurationLabel(selectedDuration);
  continueButton.textContent = `Continuer pour ${getDurationLabel(selectedDuration)}`;

  for (const button of durationOptionsEl.querySelectorAll('[data-minutes]')) {
    const isSelected = Number(button.dataset.minutes) === selectedDuration;
    button.setAttribute('aria-pressed', String(isSelected));
  }

  debug('blocked-page:duration-change', { minutes: selectedDuration });
}

durationOptionsEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-minutes]');
  if (!button) return;
  updateDuration(Number(button.dataset.minutes));
});

continueButton.addEventListener('click', async () => {
  debug('blocked-page:allow-click', { domain, hasOriginalUrl: Boolean(originalUrl), minutes: selectedMinutes() });
  if (!domain || !originalUrl) {
    statusEl.textContent = 'Impossible de retrouver le site d’origine.';
    debug('blocked-page:allow-aborted', { domain, hasOriginalUrl: Boolean(originalUrl) });
    return;
  }

  continueButton.disabled = true;
  const minutes = selectedMinutes();
  const response = await chrome.runtime.sendMessage({
    type: 'ALLOW_TEMPORARILY',
    domain,
    minutes,
  });
  debug('blocked-page:allow-response', { ok: response?.ok, error: response?.error, domain, minutes });

  if (!response.ok) {
    statusEl.textContent = response.error;
    continueButton.disabled = false;
    return;
  }

  statusEl.textContent = `Débloqué pour ${getDurationLabel(minutes)}.`;
  debug('blocked-page:redirect-original', { originalUrl });
  window.location.replace(originalUrl);
});

updateDuration(selectedDuration);
