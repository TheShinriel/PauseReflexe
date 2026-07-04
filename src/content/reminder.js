const SOFT_REMINDER_DELAY_MS = 10 * 60 * 1000;
const DEBUG_PREFIX = '[pause-reflexe]';
const REMINDER_ID = 'pause-reflexe-reminder';
const EXPIRY_ALERT_ID = 'pause-reflexe-expiry-alert';

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
  const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
  if (!response?.ok) {
    throw new Error(response?.error ?? 'Impossible de lire l’état de Pause Réflexe.');
  }

  return { allowedUntilByDomain: response.allowedUntilByDomain ?? {} };
}

function applyBannerStyle(banner, placement = 'bottom') {
  const placementStyle = placement === 'center'
    ? { top: '50%', bottom: 'auto', transform: 'translate(-50%, -50%)' }
    : { bottom: '24px', top: 'auto', transform: 'translateX(-50%)' };

  Object.assign(banner.style, {
    position: 'fixed',
    left: '50%',
    ...placementStyle,
    zIndex: '2147483647',
    maxWidth: '560px',
    width: 'calc(100% - 32px)',
    padding: placement === 'center' ? '20px 22px' : '14px 16px',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    background: '#ffffff',
    color: '#17202a',
    font: '14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 16px 45px rgb(23 32 42 / 14%)',
    display: 'grid',
    gap: '8px',
  });
}

function applyTitleStyle(title) {
  Object.assign(title.style, {
    color: '#1d4ed8',
    fontSize: '12px',
    letterSpacing: '.08em',
    textTransform: 'uppercase',
  });
}

function applyMessageStyle(message) {
  Object.assign(message.style, {
    color: '#667085',
    lineHeight: '1.4',
  });
}

function applyActionRowStyle(row) {
  Object.assign(row.style, {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '4px',
  });
}

function applyLinkButtonStyle(button) {
  Object.assign(button.style, {
    background: 'transparent',
    border: '0',
    color: '#2563eb',
    cursor: 'pointer',
    font: 'inherit',
    fontWeight: '700',
    padding: '0',
  });
}

function buildBanner({ id, titleText, messageText, placement = 'bottom' }) {
  const banner = document.createElement('div');
  banner.id = id;

  const title = document.createElement('strong');
  title.textContent = titleText;

  const message = document.createElement('span');
  message.textContent = messageText;

  banner.append(title, message);
  applyBannerStyle(banner, placement);
  applyTitleStyle(title);
  applyMessageStyle(message);

  return banner;
}

function showReminder(domain) {
  if (document.querySelector(`#${REMINDER_ID}`) || document.querySelector(`#${EXPIRY_ALERT_ID}`)) {
    debug('content:reminder-skipped-existing', { domain });
    return;
  }

  debug('content:reminder-show', { domain });
  const banner = buildBanner({
    id: REMINDER_ID,
    titleText: 'Encore utile ?',
    messageText: 'Tu avais ouvert ce site pour quelques minutes. Tu veux toujours rester ici ?',
  });

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.textContent = 'Masquer';
  applyLinkButtonStyle(dismiss);
  dismiss.addEventListener('click', () => {
    debug('content:reminder-dismiss-click', { domain });
    banner.remove();
  });

  const actions = document.createElement('div');
  applyActionRowStyle(actions);
  actions.append(dismiss);
  banner.append(actions);

  document.body.appendChild(banner);
  setTimeout(() => {
    debug('content:reminder-auto-dismiss', { domain });
    banner.remove();
  }, 15000);
}

function showExpiryAlert(domain) {
  document.querySelector(`#${REMINDER_ID}`)?.remove();
  if (document.querySelector(`#${EXPIRY_ALERT_ID}`)) {
    debug('content:expiry-alert-skipped-existing', { domain });
    return;
  }

  debug('content:expiry-alert-show', { domain });
  const banner = buildBanner({
    id: EXPIRY_ALERT_ID,
    titleText: 'Temps écoulé',
    messageText: 'L’exception temporaire est terminée. Tu veux fermer cette page maintenant ?',
    placement: 'center',
  });

  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Fermer l’onglet';
  applyLinkButtonStyle(close);
  close.addEventListener('click', async () => {
    debug('content:expiry-alert-close-click', { domain });
    await chrome.runtime.sendMessage({ type: 'CLOSE_CURRENT_TAB' });
  });

  const ignore = document.createElement('button');
  ignore.type = 'button';
  ignore.textContent = 'Ignorer';
  applyLinkButtonStyle(ignore);
  ignore.addEventListener('click', async () => {
    debug('content:expiry-alert-ignore-click', { domain });
    ignore.disabled = true;
    const response = await chrome.runtime.sendMessage({ type: 'EXTEND_TEMPORARY_ALLOW', domain });
    debug('content:expiry-alert-ignore-response', { domain, ok: response?.ok, error: response?.error, minutes: response?.minutes });

    if (!response?.ok) {
      ignore.disabled = false;
      return;
    }

    banner.remove();
    setTimeout(() => {
      showExpiryAlert(domain);
    }, response.minutes * 60 * 1000);
  });

  const actions = document.createElement('div');
  applyActionRowStyle(actions);
  actions.append(close, ignore);
  banner.append(actions);

  document.body.appendChild(banner);
}

function getSoftReminderDelayMs(until, now) {
  const remaining = until - now;
  return remaining > SOFT_REMINDER_DELAY_MS ? SOFT_REMINDER_DELAY_MS : null;
}

async function initTemporaryExceptionAlerts() {
  const domain = normalizeHost(window.location.hostname);
  debug('content:init', { domain, url: window.location.href });
  const { allowedUntilByDomain } = await getSessionState();
  const until = allowedUntilByDomain[domain];
  const now = Date.now();

  if (!until || until <= now) {
    debug('content:no-active-temporary-allow', { domain, until });
    return;
  }

  const expiryDelayMs = until - now;
  const reminderDelayMs = getSoftReminderDelayMs(until, now);

  if (reminderDelayMs !== null) {
    debug('content:reminder-scheduled', { domain, delayMs: reminderDelayMs, until });
    setTimeout(() => {
      showReminder(domain);
    }, reminderDelayMs);
  }

  debug('content:expiry-alert-scheduled', { domain, delayMs: expiryDelayMs, until });
  setTimeout(() => {
    showExpiryAlert(domain);
  }, expiryDelayMs);
}

initTemporaryExceptionAlerts().catch((error) => {
  debug('content:init:error', { error: error.message });
});
