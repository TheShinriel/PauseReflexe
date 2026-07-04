# Manual test procedure

## Chrome on macOS

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click “Load unpacked”.
4. Select `/Users/shinriel/projects/perso/site-blocker/src`.
5. Open `https://example.com`.
6. Click the extension icon.
7. Click “Mettre ce site en pause”.
8. Expected: the current-site card is replaced by a congratulation frame with a random progress message.
9. Reload `https://example.com`.
10. Expected: redirected to the extension pause page.
11. Choose 5/10/30 min with the segmented duration buttons and click temporary exception.
12. Expected: CTA label follows the selected duration and original site opens.
13. Open “Sites en pause” in the popup.
14. Expected: current site appears first if paused, with coherent card/badge styling.
15. Click “Retirer”.
16. Expected: site is removed from the list and becomes accessible after reload.
17. Toggle the quick pause switch next to the global “Actif” badge.
18. Expected: disabling pauses asks for confirmation; cancelling keeps pauses active.
19. Confirm quick pause.
20. Expected: global badge switches to paused and sites in pause are accessible until pause is disabled or browser closes.
21. Toggle the quick pause switch again.
22. Expected: pauses are re-enabled without confirmation.
23. Create a 5 min temporary exception and keep the tab open.
24. Expected: at expiry, a “Temps écoulé” banner appears with “Fermer l’onglet” and “Ignorer”.
25. Click “Fermer l’onglet”.
26. Expected: the current tab closes.
27. Visual check: popup, pause page, reminder, expiry alert, and congratulation frame share the same calm blue/white visual language.

## Windows Chrome / Firefox later

Repeat the same checklist.

Extra checks:
- `www.example.com` and subdomains are blocked when `example.com` is blocked.
- The pause page remains calm/non-culpabilizing.
- Temporary exception expires and the site is paused again.
- Reminder appears after 10 minutes on a temporary exception.
