export async function handleRuntimeMessage(message, dependencies, sender = {}) {
  const debug = dependencies.debug ?? (() => {});
  debug('runtime:received', { type: message.type, domain: message.domain, minutes: message.minutes, paused: message.paused });

  if (message.type === 'BLOCK_DOMAIN') {
    debug('runtime:block-domain:start', { domain: message.domain });
    await dependencies.addBlockedDomain(message.domain);
    await dependencies.rebuildRules();
    debug('runtime:block-domain:done', { domain: message.domain });
    return { ok: true };
  }

  if (message.type === 'UNBLOCK_DOMAIN') {
    debug('runtime:unblock-domain:start', { domain: message.domain });
    await dependencies.removeBlockedDomain(message.domain);
    await dependencies.rebuildRules();
    debug('runtime:unblock-domain:done', { domain: message.domain });
    return { ok: true };
  }

  if (message.type === 'SET_PAUSED') {
    const paused = Boolean(message.paused);
    debug('runtime:set-paused:start', { paused });
    await dependencies.setPaused(paused);
    await dependencies.rebuildRules();
    debug('runtime:set-paused:done', { paused });
    return { ok: true };
  }

  if (message.type === 'ALLOW_TEMPORARILY') {
    const minutes = Number(message.minutes);
    debug('runtime:allow-temporarily:start', { domain: message.domain, minutes });
    await dependencies.allowDomainTemporarily(message.domain, minutes);
    await dependencies.rebuildRules();
    debug('runtime:allow-temporarily:done', { domain: message.domain, minutes });
    return { ok: true };
  }

  if (message.type === 'GET_STATE') {
    debug('runtime:get-state:start');
    const local = await dependencies.getLocalState();
    const session = await dependencies.getSessionState();
    debug('runtime:get-state:done', {
      blockedCount: local.blockedDomains.length,
      paused: session.paused,
      temporaryAllowCount: Object.keys(session.allowedUntilByDomain).length,
    });
    return { ok: true, ...local, ...session };
  }

  if (message.type === 'CLOSE_CURRENT_TAB') {
    const tabId = sender.tab?.id;
    debug('runtime:close-current-tab:start', { tabId });
    if (!Number.isInteger(tabId)) {
      debug('runtime:close-current-tab:missing-tab');
      return { ok: false, error: 'Impossible de fermer cet onglet.' };
    }

    await dependencies.closeTab(tabId);
    debug('runtime:close-current-tab:done', { tabId });
    return { ok: true };
  }

  debug('runtime:unknown-message', { type: message.type });
  return { ok: false, error: `Unknown message: ${message.type ?? 'missing type'}` };
}
