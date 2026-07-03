# Temporary exception expiry alert plan

## Goal

When the user creates a temporary exception for a paused site, warn them once the selected duration has expired if the page is still open on that domain.

This closes the loophole where the site remains usable indefinitely as long as the page is not reloaded.

## UX

Keep the reminder calm but more explicit than the existing soft reminder.

- Soft reminder: for long exceptions only, after 10 minutes, if the exception still has more time remaining.
- Expiry alert: exactly when the exception expires.

Expiry copy:

- Title: `Temps écoulé`
- Message: `L’exception temporaire est terminée. Tu veux fermer cette page maintenant ?`
- Primary action: `Fermer l’onglet`
- Secondary action: `Ignorer`

No automatic close. The user keeps control.

## Technical approach

1. Extract timer scheduling logic into pure helpers in `src/shared/temporary-exception-alerts.js`:
   - compute delay until expiry;
   - decide if the soft reminder should be shown before expiry.
2. Update `src/content/reminder.js`:
   - read `allowedUntilByDomain[domain]`;
   - if expired/no exception: do nothing;
   - schedule soft reminder only if the exception lasts longer than 10 minutes;
   - schedule expiry alert at `until - Date.now()`;
   - inject an alert banner with Close/Ignorer actions.
3. Add background message `CLOSE_CURRENT_TAB`:
   - service worker receives message from content script;
   - closes `sender.tab.id` via `chrome.tabs.remove`;
   - returns an error if no sender tab is available.
4. Keep this feature as a content-script banner, not a browser notification, to stay in context.

## Tests

- Pure timing helpers.
- Runtime message handler closes the sender tab.
- Runtime message handler rejects close when no sender tab exists.

## Verification

Run:

```bash
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npm run test:run && npm run validate:manifest
```

Manual test after reload:

1. Pause `example.com`.
2. Open it and make a 5 min exception.
3. Keep the tab open.
4. At expiry, verify the `Temps écoulé` banner appears.
5. Click `Fermer l’onglet` and verify the tab closes.
