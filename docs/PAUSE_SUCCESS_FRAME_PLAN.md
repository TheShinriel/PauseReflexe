# Pause success frame plan

## Goal

After the user clicks `Mettre ce site en pause` and the action succeeds, replace the current-site card content with a short congratulation frame.

This reinforces the habit-change positioning: the moment of adding a pause should feel like progress, not punishment.

## UX

Show this only immediately after a successful pause action from the popup.

Frame content:

- eyebrow: `Site mis en pause`
- title: `Bravo`
- message: one random congratulation sentence

Message pool:

1. `Bravo, une étape de plus vers un changement.`
2. `Bien joué. Tu viens de rendre ce réflexe un peu moins automatique.`
3. `C’est posé. La prochaine ouverture demandera un vrai choix.`
4. `Bonne décision. Une petite friction peut changer beaucoup de choses.`
5. `Tu viens de reprendre un peu la main sur cette habitude.`
6. `Pause ajoutée. Le réflexe aura maintenant quelques secondes de moins pour gagner.`

Keep the full blocked-sites list below, so the user can still remove the domain if needed.

## Technical approach

- Centralize the message pool in `src/shared/copy.js`.
- Add predictable selector helpers for tests.
- Add a hidden success frame in `src/popup/popup.html`.
- In `src/popup/popup.js`, after a successful `BLOCK_DOMAIN`, pick a random success message and show the frame instead of the standard current-site controls.
- Reset the success frame on init or when the current domain is removed.

## Tests

- Verify the message pool exists and contains several messages.
- Verify deterministic message selection and fallback.
- Verify random selection can be injected with a fake RNG.

## Verification

Run:

```bash
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npm run test:run && npm run validate:manifest
```
