# Plan: logs de debug développement

## Objectif

Ajouter des logs explicites pour suivre chaque action utilisateur et chaque message runtime pendant les tests manuels.

## Emplacements des logs

- Service worker : réception/traitement des messages `BLOCK_DOMAIN`, `UNBLOCK_DOMAIN`, `SET_PAUSED`, `ALLOW_TEMPORARILY`, `GET_STATE`, rebuild des règles DNR.
- Popup : actions utilisateur depuis la popup, requêtes envoyées au service worker, réponses reçues, refresh/rendu de la liste.
- Page bloquée : slider, clic de déblocage temporaire, réponse puis redirection.
- Site courant : uniquement le content script de rappel doux après déblocage temporaire.

## Étapes

1. Ajouter un test de régression sur le logger injectable du routeur service worker.
2. Ajouter un helper de debug partagé avec préfixe stable `[site-blocker]`.
3. Instrumenter le routeur de messages et le rebuild DNR côté service worker.
4. Instrumenter popup, page bloquée et content script de rappel.
5. Relancer tests + validation manifest.

## Rollback

Supprimer les appels `debug(...)` et le helper partagé. Les logs ne modifient pas l'état métier.
