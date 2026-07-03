# Pause Réflexe

Pause Réflexe est une extension navigateur pour reprendre la main sur les sites qu’on ouvre par réflexe.

Ce n’est pas un bloqueur punitif, un outil de contrôle parental ou une promesse anti-contournement. L’objectif est plus simple : créer une pause entre l’habitude et l’ouverture du site.

Quand un site est mis en pause, l’extension intercepte l’accès et affiche une question courte avant de continuer. L’utilisateur peut faire une exception temporaire, parce qu’un changement d’habitude durable doit accepter quelques écarts légers plutôt que pousser à désactiver l’extension.

## Positionnement

Pause Réflexe s’adresse aux personnes qui veulent réduire l’usage automatique de certains sites : YouTube, Instagram, Reddit, 9gag, réseaux sociaux, sites d’actualité, plateformes de vidéo ou de scroll infini.

La promesse produit :

> Bloquer volontairement les sites qu’on ouvre sans y penser, avec assez de souplesse pour rester utilisable dans la durée.

## Fonctionnalités

- Mettre le domaine courant en pause depuis la popup.
- Appliquer la pause au domaine et à ses sous-domaines.
- Rediriger vers une page calme : “Pause avant d’ouvrir”.
- Afficher un message aléatoire entre neutre et légèrement piquant.
- Faire une exception temporaire de 5, 10 ou 30 minutes.
- Afficher les sites en pause dans la popup.
- Retirer un site de la liste.
- Désactiver temporairement toutes les pauses pour la session, avec confirmation.
- Afficher un rappel léger après quelques minutes sur une exception temporaire.

## Ce que l’extension ne promet pas

Pause Réflexe n’est pas conçue pour empêcher un utilisateur déterminé de contourner le blocage.

Elle ne vise pas :

- le contrôle parental ;
- le blocage administrateur inviolable ;
- la surveillance ;
- les statistiques avancées ;
- la culpabilisation.

Elle vise une friction volontaire et acceptable pour accompagner un changement d’habitude.

## Installation locale

Prérequis :

- Node.js 24 via `nvm` ;
- Chrome ou un navigateur compatible Manifest V3.

Installer les dépendances :

```bash
npm install
```

Lancer les tests :

```bash
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npm run test:run
```

Valider le manifeste :

```bash
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npm run validate:manifest
```

## Charger l’extension dans Chrome

1. Ouvrir `chrome://extensions`.
2. Activer le mode développeur.
3. Cliquer sur “Load unpacked”.
4. Sélectionner le dossier `src/` du dépôt.
5. Après chaque modification du service worker ou du manifeste, cliquer sur “Reload”.

## Structure du projet

```text
src/
  background/   Service worker Manifest V3
  blocked/      Page affichée quand un site est en pause
  content/      Rappel injecté sur les pages temporairement autorisées
  popup/        Interface popup de l’extension
  shared/       Logique partagée et testable

tests/          Tests unitaires Vitest
docs/           Plans, PRD et procédures de test manuel
```

## Commandes utiles

```bash
npm run test:run
npm run validate:manifest
```

## Roadmap courte

- Alerter quand une exception temporaire expire alors qu’un onglet du domaine est encore ouvert.
- Proposer de fermer l’onglet ou de prolonger l’exception.
- Tester et ajuster le comportement Firefox.
- Ajouter éventuellement une page d’options plus complète.
- Import/export de la liste des sites en pause.

## Licence

Ce projet est distribué sous licence MIT. Voir `LICENSE`.
