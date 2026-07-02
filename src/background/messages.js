export async function handleRuntimeMessage(message, dependencies) {
  if (message.type === 'BLOCK_DOMAIN') {
    await dependencies.addBlockedDomain(message.domain);
    await dependencies.rebuildRules();
    return { ok: true };
  }

  if (message.type === 'UNBLOCK_DOMAIN') {
    await dependencies.removeBlockedDomain(message.domain);
    await dependencies.rebuildRules();
    return { ok: true };
  }

  if (message.type === 'SET_PAUSED') {
    await dependencies.setPaused(Boolean(message.paused));
    await dependencies.rebuildRules();
    return { ok: true };
  }

  if (message.type === 'ALLOW_TEMPORARILY') {
    await dependencies.allowDomainTemporarily(message.domain, Number(message.minutes));
    await dependencies.rebuildRules();
    return { ok: true };
  }

  if (message.type === 'GET_STATE') {
    const local = await dependencies.getLocalState();
    const session = await dependencies.getSessionState();
    return { ok: true, ...local, ...session };
  }

  return { ok: false, error: `Unknown message: ${message.type ?? 'missing type'}` };
}
