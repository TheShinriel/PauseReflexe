# Manual test procedure

## Chrome on macOS

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click “Load unpacked”.
4. Select `/Users/shinriel/projects/perso/site-blocker/src`.
5. Open `https://example.com`.
6. Click the extension icon.
7. Click “Bloquer ce site”.
8. Reload `https://example.com`.
9. Expected: redirected to the extension blocked page.
10. Choose 5/10/30 min with the segmented duration buttons and click temporary unblock.
11. Expected: CTA label follows the selected duration and original site opens.
12. Open “Sites bloqués” in the popup.
13. Expected: current site appears first if blocked, with coherent card/badge styling.
14. Click “Débloquer”.
15. Expected: site is removed from the list and becomes accessible after reload.
16. Toggle pause in popup.
17. Expected: global badge switches between active/paused and blocked sites are accessible until pause is disabled or browser closes.
18. Visual check: popup, blocked page, and reminder share the same calm blue/white visual language.

## Windows Chrome / Firefox later

Repeat the same checklist.

Extra checks:
- `www.example.com` and subdomains are blocked when `example.com` is blocked.
- The blocked page remains calm/non-culpabilizing.
- Temporary unblock expires and the site is blocked again.
- Reminder appears after 10 minutes on a temporarily unblocked site.
