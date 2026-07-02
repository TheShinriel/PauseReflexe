# Site Blocker — PRD

## Objectif

Créer une extension navigateur compatible Firefox et Chrome qui aide l’utilisateur à réduire l’accès volontaire à des sites choisis, sans blocage punitif.

L’utilisateur doit pouvoir décider lui-même de bloquer un domaine complet, puis être redirigé vers une page douce de rappel lorsqu’il tente d’y accéder.

Le produit vise le changement d’habitude : créer une friction légère, pas enfermer l’utilisateur.

## Problème

Les bloqueurs classiques sont souvent trop binaires :
- soit ils bloquent durement, ce qui pousse à désinstaller l’extension ;
- soit ils sont trop faciles à contourner, donc inutiles.

Le besoin est un blocage volontaire, explicite, réversible temporairement, avec rappel comportemental.

## Utilisateurs cibles

- Personnes qui veulent réduire certains sites chronophages.
- Personnes qui veulent garder un accès exceptionnel sans casser leur engagement.
- Utilisateurs desktop Chrome/Firefox en priorité.

## MVP

### Fonctionnalités incluses

1. Popup extension
   - Bouton : “Bloquer ce site”
   - Affiche le domaine courant
   - Switch : “Désactiver les blocages”
   - Le switch désactive les blocages jusqu’à fermeture du navigateur ou réactivation manuelle

2. Blocage domaine
   - Bloque le domaine courant et ses sous-domaines
   - Exemple : bloquer `example.com` bloque aussi `www.example.com`, `app.example.com`, etc.

3. Redirection de blocage
   - Toute tentative d’accès à un domaine bloqué redirige vers une page interne de l’extension
   - La page explique que le site est bloqué car l’utilisateur l’a choisi

4. Déblocage temporaire par slider
   - Pas de simple bouton “continuer”
   - Utiliser un slider pour rendre le contournement volontaire
   - Options MVP proposées : 5 min, 10 min, 30 min
   - 30 min est l’option maximale pour le MVP

5. Rappel léger après 10 minutes
   - Si l’utilisateur est encore sur un site temporairement débloqué après 10 minutes, afficher un rappel non agressif
   - Objectif : remettre l’intention initiale au premier plan
   - Le rappel ne doit pas fermer la page ni bloquer brutalement

## Hors périmètre MVP

- Synchronisation cloud
- Mode parental / anti-contournement fort
- Mot de passe administrateur
- Statistiques avancées
- Blocage mobile natif de l’app YouTube ou autres apps
- Import/export de listes
- Catégories automatiques de sites

## Expérience utilisateur

### Bloquer un site

1. L’utilisateur visite un site.
2. Il clique sur l’icône de l’extension.
3. La popup affiche : “Domaine actuel : example.com”.
4. Il clique sur “Bloquer ce site”.
5. Le domaine et ses sous-domaines sont ajoutés à la liste de blocage.
6. Les futures visites redirigent vers la page bloquée.

### Accès à un site bloqué

1. L’utilisateur tente d’ouvrir `example.com`.
2. Il est redirigé vers `blocked.html`.
3. Message : “Tu as choisi de bloquer ce site.”
4. L’utilisateur peut choisir une durée temporaire via slider.
5. Après validation, la page d’origine est rechargée sans blocage pendant la durée choisie.

### Pause globale

1. L’utilisateur ouvre la popup.
2. Il active “Désactiver les blocages”.
3. Tous les blocages sont suspendus jusqu’à fermeture du navigateur ou réactivation.
4. La popup doit rendre cet état très visible.

## Principes UX

- Ton calme, non culpabilisant.
- Friction douce, pas punitive.
- Toujours rappeler que le blocage vient d’une décision de l’utilisateur.
- Éviter le dark pattern inverse : ne pas piéger l’utilisateur.
- Le contournement doit être possible mais intentionnel.

## Faisabilité technique

### API principale

Utiliser `declarativeNetRequest` en Manifest V3.

Raisons :
- compatible Chrome ;
- supporté par Firefox ;
- adapté au blocage/redirection réseau ;
- plus durable que `webRequest` bloquant.

### Règles

- Règles dynamiques persistantes pour les domaines bloqués.
- Règles de session ou état temporaire pour les exceptions temporaires.
- Redirection vers une page interne `blocked.html`.

### Permissions probables

- `declarativeNetRequest`
- `storage`
- `tabs` ou `activeTab` pour lire l’URL courante depuis la popup
- host permissions à préciser selon la stratégie de redirection

### Pages extension

- `popup.html` : menu depuis l’icône
- `blocked.html` : page de rappel + slider
- script background/service worker : gestion règles, stockage, exceptions

## Points techniques à valider tôt

1. Redirection vers une page interne extension sur Chrome et Firefox.
2. Passage propre de l’URL d’origine à `blocked.html`.
3. Ajout/suppression dynamique de règles `declarativeNetRequest`.
4. Pause globale de session.
5. Exception temporaire par domaine sans supprimer le blocage persistant.
6. Rappel après 10 minutes sur une page temporairement débloquée.

## Risques

1. Différences Chrome / Firefox
   - Même API, mais comportements parfois différents.
   - Tester les deux navigateurs dès le MVP.

2. Gestion des exceptions temporaires
   - Risque de conflit entre règles de blocage persistantes et règles d’autorisation temporaire.
   - À prototyper tôt.

3. Définition du domaine racine
   - `www.example.com` doit devenir `example.com`.
   - Attention aux domaines publics type `co.uk`.
   - Utiliser une Public Suffix List ou une librairie fiable.

4. Rappel après 10 minutes
   - Demande probablement un content script injecté sur les domaines temporairement autorisés.
   - À garder simple pour le MVP.

5. Contournement volontaire
   - L’extension ne doit pas promettre un blocage impossible à contourner.
   - Positionnement : aide comportementale, pas contrôle parental.

## Critères d’acceptation MVP

- Depuis Chrome, l’utilisateur peut bloquer le domaine courant.
- Depuis Firefox, l’utilisateur peut bloquer le domaine courant.
- Le domaine bloqué et ses sous-domaines redirigent vers `blocked.html`.
- `blocked.html` affiche un message clair et non culpabilisant.
- L’utilisateur peut débloquer temporairement via slider.
- Le déblocage temporaire expire automatiquement.
- Le switch de pause globale suspend les blocages jusqu’à fermeture navigateur ou réactivation.
- Un rappel léger apparaît après 10 minutes sur un site temporairement débloqué.

## Décisions ouvertes

1. Durées exactes du slider : 5/10/30 min ou autre ?
2. Le rappel après 10 min doit-il être une bannière, une notification navigateur, ou une modal légère ?
3. Le déblocage temporaire s’applique-t-il au domaine entier ou seulement à l’URL initiale ?
4. Faut-il une liste des sites bloqués dans la popup dès le MVP ?
5. Faut-il un bouton “débloquer définitivement” dans la page bloquée ou uniquement dans les options ?

## Recommandations produit

- Déblocage temporaire par domaine, pas par URL : plus simple et plus compréhensible.
- Rappel sous forme de bannière non bloquante : moins agressif qu’une modal.
- Liste des sites bloqués : pas nécessaire dans le MVP, mais prévoir une page options ensuite.
- Déblocage définitif : éviter sur `blocked.html`; le mettre plutôt dans une page options pour garder la friction.

## Plan de validation technique initial

1. Créer une extension MV3 minimale.
2. Ajouter une règle dynamique qui redirige `example.com` vers `blocked.html`.
3. Tester Chrome.
4. Tester Firefox.
5. Ajouter stockage du domaine courant.
6. Ajouter exception temporaire 5 minutes.
7. Vérifier expiration et reblocage.

## Succès du MVP

Le MVP est réussi si l’utilisateur ressent une friction claire mais acceptable :
- il se rappelle pourquoi il a bloqué le site ;
- il peut continuer temporairement s’il le veut vraiment ;
- il n’a pas envie de désinstaller l’extension au premier blocage.
