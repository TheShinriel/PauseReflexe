# UI Coherence Implementation Plan

> **For Hermes:** Execute directly task-by-task on branch `feat/mvp-site-blocker`; no PR/merge/deploy.

**Goal:** Unifier l'identité graphique de l'extension autour d'une UX calme, volontaire et non punitive.

**Architecture:** Créer un thème CSS partagé pour la popup et la page bloquée, puis réorganiser les écrans en cartes, badges et boutons cohérents. Le rappel injecté dans le site courant garde du style inline, mais reprend les mêmes tokens visuels.

**Tech Stack:** WebExtension MV3, HTML/CSS/JS modules, Vitest.

---

## Task 1: Ajouter un test RED pour les durées segmentées

**Objective:** Couvrir le nouveau comportement de sélection 5/10/30 min sans dépendre du DOM.

**Files:**
- Create: `src/shared/durations.js`
- Create: `tests/durations.test.js`

**Steps:**
1. Écrire un test qui attend `BYPASS_DURATIONS_MINUTES = [5, 10, 30]` et `getDurationLabel(10) === '10 min'`.
2. Lancer `npm run test:run -- tests/durations.test.js` et vérifier RED.
3. Implémenter `src/shared/durations.js`.
4. Relancer le test et vérifier GREEN.

## Task 2: Créer le thème CSS partagé

**Objective:** Centraliser couleurs, spacing, radius, shadows et composants de base.

**Files:**
- Create: `src/shared/theme.css`
- Modify: `src/popup/popup.css`
- Modify: `src/blocked/blocked.css`

**Steps:**
1. Définir tokens `--color-*`, `--space-*`, `--radius-*`, `--shadow-*`.
2. Ajouter composants `.app-shell`, `.app-card`, `.domain-chip`, `.status-pill`, `.button-primary`, `.button-secondary`, `.button-danger-soft`, `.muted`.
3. Importer via `@import url('../shared/theme.css');` dans popup/blocked CSS.

## Task 3: Recomposer la popup

**Objective:** Rendre l'état courant lisible et harmoniser les actions.

**Files:**
- Modify: `src/popup/popup.html`
- Modify: `src/popup/popup.css`
- Modify: `src/popup/popup.js`

**Steps:**
1. Ajouter header + badge état global.
2. Ajouter carte domaine courant avec `domain-chip`, badge état domaine, bouton primaire.
3. Ajouter carte session avec switch pause.
4. Ajouter carte sites bloqués avec compteur, tri, liste et bouton danger doux.
5. Mettre à jour JS pour remplir les badges/compteur.

## Task 4: Recomposer la page bloquée

**Objective:** Aligner la page de blocage avec la popup et remplacer le slider par des choix segmentés.

**Files:**
- Modify: `src/blocked/blocked.html`
- Modify: `src/blocked/blocked.css`
- Modify: `src/blocked/blocked.js`

**Steps:**
1. Utiliser la carte et les tokens partagés.
2. Afficher le domaine en `domain-chip`.
3. Remplacer le range par 3 boutons 5/10/30.
4. Faire varier le CTA: `Continuer pour X min`.

## Task 5: Harmoniser le rappel content script

**Objective:** Rendre le rappel cohérent avec les cartes/badges sans CSS externe.

**Files:**
- Modify: `src/content/reminder.js`

**Steps:**
1. Remplacer la bannière sombre par une carte blanche, bord bleu doux, shadow légère.
2. Garder fermeture clic + auto-fermeture.

## Task 6: Vérifier et committer

**Commands:**
- `source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npm run test:run && npm run validate:manifest`
- `git status --short`
- Commit: `feat: unify extension interface design`

**Manual note:** Après changement UI/service worker, recharger l'extension dans `chrome://extensions`.
