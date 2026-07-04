export const APP_COPY = {
  name: 'Pause Réflexe',
  description: 'Reprends la main sur les sites que tu ouvres par réflexe.',
  eyebrow: 'Changer une habitude',
};

export const BLOCKED_PAGE_MESSAGES = [
  'Tu voulais éviter d’aller sur ce site par réflexe. Prends 5 secondes avant de continuer.',
  'Tu voulais vraiment venir ici, ou ton réflexe a gagné ?',
  'L’objectif n’est pas d’être parfait. Juste de ne pas ouvrir ce site sans t’en rendre compte.',
  'Ce site est en pause. Tu peux continuer, mais fais-le volontairement.',
  'Si tu es venu ici par réflexe, c’est exactement le moment de t’arrêter.',
  'Tu as choisi de mettre ce site à distance pour changer une habitude.',
];

export const REMINDER_COPY = {
  title: 'Encore utile ?',
  message: 'Tu avais ouvert ce site pour quelques minutes. Tu veux toujours rester ici ?',
  dismiss: 'Masquer',
};

export const PAUSE_SUCCESS_MESSAGES = [
  'Bravo, une étape de plus vers un changement.',
  'Bien joué. Tu viens de rendre ce réflexe un peu moins automatique.',
  'C’est posé. La prochaine ouverture demandera un vrai choix.',
  'Bonne décision. Une petite friction peut changer beaucoup de choses.',
  'Tu viens de reprendre un peu la main sur cette habitude.',
  'Pause ajoutée. Le réflexe aura maintenant quelques secondes de moins pour gagner.',
];

export function getPauseSuccessMessage(index = 0) {
  if (!Number.isInteger(index) || index < 0) return PAUSE_SUCCESS_MESSAGES[0];
  return PAUSE_SUCCESS_MESSAGES[index % PAUSE_SUCCESS_MESSAGES.length];
}

export function getRandomPauseSuccessMessage(random = Math.random) {
  return getPauseSuccessMessage(Math.floor(random() * PAUSE_SUCCESS_MESSAGES.length));
}

export function getBlockedPageMessage(index = 0) {
  if (!Number.isInteger(index) || index < 0) return BLOCKED_PAGE_MESSAGES[0];
  return BLOCKED_PAGE_MESSAGES[index % BLOCKED_PAGE_MESSAGES.length];
}

export function getRandomBlockedPageMessage(random = Math.random) {
  return getBlockedPageMessage(Math.floor(random() * BLOCKED_PAGE_MESSAGES.length));
}

export function getExceptionCta(minutes) {
  return `Faire une exception de ${minutes} min`;
}
