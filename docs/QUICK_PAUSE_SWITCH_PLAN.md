# Quick Pause Switch Implementation Plan

**Goal:** Supprimer le bloc secondaire “Déblocage ponctuel” et déplacer la pause globale à côté du statut “Actif”, avec confirmation uniquement lors de la désactivation des blocages.

**Architecture:** Garder le message runtime existant `SET_PAUSED`. Ajouter un petit helper pur pour déterminer si une confirmation est nécessaire, puis brancher `window.confirm` dans la popup au moment où l’utilisateur passe le switch vers l’état pause.

## Tasks

1. Vérifier état git et fichiers popup.
2. Ajouter un test RED pour `requiresPauseConfirmation({ nextPaused, currentPaused })`.
3. Implémenter le helper dans `src/shared/pause-confirmation.js`.
4. Modifier `popup.html` :
   - supprimer le bloc `<section class="session-card">` complet ;
   - ajouter un switch compact à côté du badge `#globalStatus` dans le header.
5. Modifier `popup.css` :
   - supprimer les styles inutiles `.session-*` ;
   - ajouter styles `.quick-pause`, `.quick-pause-switch`.
6. Modifier `popup.js` :
   - importer le helper ;
   - appeler `window.confirm(...)` seulement quand on désactive les blocages ;
   - si refus, remettre le switch à l’état précédent et ne pas envoyer `SET_PAUSED` ;
   - réactivation sans confirmation.
7. Vérifier : `source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npm run test:run && npm run validate:manifest`.
8. Committer.
