import { describe, expect, it, vi } from 'vitest';
import { handleRuntimeMessage } from '../src/background/messages.js';

describe('handleRuntimeMessage', () => {
  it('handles definitive domain unblock messages', async () => {
    const removeBlockedDomain = vi.fn().mockResolvedValue(['other.com']);
    const rebuildRules = vi.fn().mockResolvedValue(undefined);

    const response = await handleRuntimeMessage(
      { type: 'UNBLOCK_DOMAIN', domain: 'example.com' },
      {
        addBlockedDomain: vi.fn(),
        allowDomainTemporarily: vi.fn(),
        getLocalState: vi.fn(),
        getSessionState: vi.fn(),
        rebuildRules,
        removeBlockedDomain,
        setPaused: vi.fn(),
      },
    );

    expect(response).toEqual({ ok: true });
    expect(removeBlockedDomain).toHaveBeenCalledWith('example.com');
    expect(rebuildRules).toHaveBeenCalledOnce();
  });
});
