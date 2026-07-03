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

  const title = document.createElement('strong');
  title.textContent = 'Rappel doux';

  const message = document.createElement('span');
  message.textContent = `Tu avais bloqué ${domain}. Est-ce encore utile d’être ici ?`;

  const dismiss = document.createElement('span');
  dismiss.textContent = 'Masquer';

  banner.append(title, message, dismiss);
  Object.assign(banner.style, {
    position: 'fixed',
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    zIndex: '2147483647',
    maxWidth: '560px',
    width: 'calc(100% - 32px)',
    padding: '14px 16px',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    background: '#ffffff',
    color: '#17202a',
    font: '14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 16px 45px rgb(23 32 42 / 14%)',
    display: 'grid',
    gap: '4px',
  });
  Object.assign(title.style, {
    color: '#1d4ed8',
    fontSize: '12px',
    letterSpacing: '.08em',
    textTransform: 'uppercase',
  });
  Object.assign(message.style, {
    color: '#667085',
    lineHeight: '1.4',
  });
  Object.assign(dismiss.style, {
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: '700',
    justifySelf: 'start',
    marginTop: '4px',
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
