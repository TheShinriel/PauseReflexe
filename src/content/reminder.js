const REMINDER_DELAY_MS = 10 * 60 * 1000;
const DEBUG_PREFIX = '[site-blocker]';

function debug(event, details = undefined) {
  if (details === undefined) {
    console.debug(DEBUG_PREFIX, event);
    return;
  }

  console.debug(DEBUG_PREFIX, event, details);
}

const COMMON_MULTI_PART_SUFFIXES = new Set(['co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'com.au', 'net.au', 'org.au', 'co.nz', 'com.br', 'com.cn', 'co.jp']);

function normalizeHost(hostname) {
  const parts = hostname.toLowerCase().replace(/^www\./, '').split('.').filter(Boolean);
  if (parts.length <= 2) return parts.join('.');

  const suffix = parts.slice(-2).join('.');
  if (COMMON_MULTI_PART_SUFFIXES.has(suffix) && parts.length >= 3) {
    return parts.slice(-3).join('.');
  }

  return parts.slice(-2).join('.');
}

async function getSessionState() {
  const storage = chrome.storage.session ?? chrome.storage.local;
  return storage.get({ allowedUntilByDomain: {} });
}

function showReminder(domain) {
  if (document.querySelector('#site-blocker-reminder')) {
    debug('content:reminder-skipped-existing', { domain });
    return;
  }

  debug('content:reminder-show', { domain });
  const banner = document.createElement('div');
  banner.id = 'site-blocker-reminder';
  banner.textContent = `Rappel doux : tu avais bloqué ${domain}. Est-ce encore utile d’être ici ?`;
  Object.assign(banner.style, {
    position: 'fixed',
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    zIndex: '2147483647',
    maxWidth: '520px',
    padding: '12px 16px',
    borderRadius: '999px',
    background: '#17202a',
    color: 'white',
    font: '14px system-ui, sans-serif',
    boxShadow: '0 10px 30px rgb(0 0 0 / 25%)',
  });
  banner.addEventListener('click', () => {
    debug('content:reminder-dismiss-click', { domain });
    banner.remove();
  });
  document.body.appendChild(banner);
  setTimeout(() => {
    debug('content:reminder-auto-dismiss', { domain });
    banner.remove();
  }, 15000);
}

(async () => {
  const domain = normalizeHost(window.location.hostname);
  debug('content:init', { domain, url: window.location.href });
  const { allowedUntilByDomain } = await getSessionState();
  const until = allowedUntilByDomain[domain];

  if (!until || until <= Date.now()) {
    debug('content:no-active-temporary-allow', { domain, until });
    return;
  }

  debug('content:reminder-scheduled', { domain, delayMs: REMINDER_DELAY_MS, until });
  setTimeout(() => {
    showReminder(domain);
  }, REMINDER_DELAY_MS);
})();
