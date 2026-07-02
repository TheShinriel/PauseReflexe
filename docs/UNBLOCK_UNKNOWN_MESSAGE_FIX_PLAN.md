# Fix: message "Unknown message" au déblocage

## Objectif

Éviter qu'une action de déblocage définitif affiche `Unknown message` dans la popup.

## Hypothèse racine

Le message `UNBLOCK_DOMAIN` doit être traité par le service worker. Le code l'a été ajouté directement dans le listener, mais aucune régression automatisée ne vérifie le routage des messages. Si le routage chargé par le navigateur est obsolète ou diverge, la popup reçoit la réponse fallback `Unknown message`.

## Plan

1. Extraire le routage des messages du service worker dans un helper testable.
2. Ajouter un test de régression qui vérifie que `UNBLOCK_DOMAIN` appelle bien `removeBlockedDomain` puis `rebuildRules`.
3. Rebrancher le service worker sur ce helper.
4. Relancer tests et validation manifest.
5. Rappeler en handoff qu'une extension unpacked doit être rechargée dans `chrome://extensions` après modification du code.
