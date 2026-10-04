/**
 * Messages affichés pour la connexion du compte Stripe (s19).
 * Dans un module à part : un fichier "use server" ne peut exporter que des fonctions asynchrones.
 * Messages volontairement génériques : aucune cause Stripe, aucun détail de clé.
 */
export const CONNECT_ERRORS = {
  refused: "Impossible de valider cette clé Stripe. Vérifiez la clé et réessayez.",
  rateLimited: "Trop de tentatives. Réessayez dans quelques instants.",
  alreadyConnected: "Un compte Stripe est déjà connecté ou en cours de déconnexion.",
  unexpected: "Une erreur est survenue. Réessayez plus tard.",
} as const

/** Refus de publication d'un cours sans compte Stripe actif (affiché au prof). */
export const PUBLISH_BLOCKED_MESSAGE =
  "Publication indisponible : connectez un compte Stripe actif pour permettre l'achat de ce cours."
