# Manual test procedure

## Chrome on macOS

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click “Load unpacked”.
4. Select `/Users/shinriel/projects/perso/site-blocker/src`.
5. Open `https://example.com`.
6. Click the extension icon.
7. Click “Mettre ce site en pause”.
8. Reload `https://example.com`.
9. Expected: redirected to the extension pause page.
10. Choose 5/10/30 min with the segmented duration buttons and click temporary exception.
11. Expected: CTA label follows the selected duration and original site opens.
12. Open “Sites en pause” in the popup.
13. Expected: current site appears first if paused, with coherent card/badge styling.
14. Click “Retirer”.
15. Expected: site is removed from the list and becomes accessible after reload.
16. Toggle the quick pause switch next to the global “Actif” badge.
17. Expected: disabling pauses asks for confirmation; cancelling keeps pauses active.
18. Confirm quick pause.
19. Expected: global badge switches to paused and sites in pause are accessible until pause is disabled or browser closes.
20. Toggle the quick pause switch again.
21. Expected: pauses are re-enabled without confirmation.
22. Create a 5 min temporary exception and keep the tab open.
23. Expected: at expiry, a “Temps écoulé” banner appears with “Fermer l’onglet” and “Ignorer”.
24. Click “Fermer l’onglet”.
25. Expected: the current tab closes.
26. Visual check: popup, pause page, reminder, and expiry alert share the same calm blue/white visual language.

## Windows Chrome / Firefox later

Repeat the same checklist.

Extra checks:
- `www.example.com` and subdomains are blocked when `example.com` is blocked.
- The pause page remains calm/non-culpabilizing.
- Temporary exception expires and the site is paused again.
- Reminder appears after 10 minutes on a temporary exception.
