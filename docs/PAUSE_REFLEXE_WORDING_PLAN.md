# Pause Réflexe wording implementation plan

## Objectif

Renommer l’extension en **Pause Réflexe** et aligner tous les textes sur le positionnement validé : changement d’habitude, blocage volontaire, exceptions temporaires acceptées, ton neutre à légèrement piquant.

## Décisions validées

- Nom : `Pause Réflexe`.
- Niche : personnes qui veulent changer une habitude numérique et casser l’ouverture automatique de certains sites.
- Lexique principal : pause, réflexe, habitude, reprendre la main, exception temporaire.
- `Site en pause` / `Sites en pause` assumés partout.
- Messages piquants autorisés en V1, mais limités dans un pool de messages.

## Changements prévus

1. Créer un module `src/shared/copy.js` avec :
   - identité de l’app ;
   - messages de page bloquée ;
   - helper de sélection de message ;
   - textes réutilisables.
2. Ajouter tests unitaires sur :
   - nom/description ;
   - pool de messages ;
   - fallback de sélection.
3. Mettre à jour :
   - `manifest.json` ;
   - popup HTML/JS ;
   - page bloquée HTML/JS ;
   - rappel content script ;
   - préfixe debug.
4. Mettre à jour `docs/MANUAL_TESTS.md` avec les nouveaux libellés.
5. Valider avec :
   - `source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npm run test:run && npm run validate:manifest`.

## Rollback

Tous les changements sont textuels ou dans un module partagé isolé. Revenir au commit précédent suffit si le wording ne convient pas.
