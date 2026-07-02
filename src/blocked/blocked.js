const DURATIONS = [5, 10, 30];

const domainEl = document.querySelector('#domain');
const durationInput = document.querySelector('#duration');
const durationLabel = document.querySelector('#durationLabel');
const continueButton = document.querySelector('#continueButton');
const statusEl = document.querySelector('#status');

const params = new URLSearchParams(window.location.search);
const domain = params.get('domain');
const originalUrl = extractOriginalUrl();

domainEl.textContent = domain || 'ce site';

function extractOriginalUrl() {
  const marker = '&url=';
  const index = window.location.href.indexOf(marker);
  if (index === -1) return null;
  return window.location.href.slice(index + marker.length);
}

function selectedMinutes() {
  return DURATIONS[Number(durationInput.value)] ?? 10;
}

function updateLabel() {
  durationLabel.textContent = `${selectedMinutes()} min`;
}

durationInput.addEventListener('input', updateLabel);

continueButton.addEventListener('click', async () => {
  if (!domain || !originalUrl) {
    statusEl.textContent = 'Impossible de retrouver le site d’origine.';
    return;
  }

  continueButton.disabled = true;
  const minutes = selectedMinutes();
  const response = await chrome.runtime.sendMessage({
    type: 'ALLOW_TEMPORARILY',
    domain,
    minutes,
  });

  if (!response.ok) {
    statusEl.textContent = response.error;
    continueButton.disabled = false;
    return;
  }

  statusEl.textContent = `Débloqué pour ${minutes} minutes.`;
  window.location.replace(originalUrl);
});

updateLabel();
