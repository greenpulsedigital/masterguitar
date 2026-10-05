# ADR 008 — Intention de checkout persistée

- Status: accepted
- Date: 2026-10-05
- Scope: story s20-checkout-per-prof

## Context
Avec s20, chaque Checkout Session est créée avec la clé Stripe **du prof** (ADR 004, s19). Le webhook vérifie la signature avec le secret du prof, mais tout ce que contient la session (montant, devise, metadata) vient d'un compte que la plateforme ne contrôle pas. Si la clé d'un prof fuit, quelqu'un peut créer une session à 1 centime avec des metadata qui désignent un cours de ce prof et un utilisateur de son choix : le webhook actuel (montant > 0, devise `eur`) accorderait l'accès. Le contrôle cross-prof de s20 limite la portée aux cours de ce prof, sans la supprimer.

## Decision
Le checkout enregistre en base, **avant** d'appeler Stripe, une ligne `CheckoutIntent` qui fige le prof, le compte Stripe (`stripeAccountId`, mode), le cours, l'acheteur, le montant et la devise. Son identifiant part dans `metadata.intentId` et dans `success_url` ; l'identifiant de session renvoyé par Stripe y est ensuite enregistré. Le webhook et la page de succès n'accordent ou n'affichent rien si la session ne correspond pas exactement à une intention existante : même prof, même compte et même mode, même cours, même acheteur, même montant, même devise, même identifiant de session.

## Considered options
- Garder les contrôles actuels (montant > 0, `eur`) — rejeté : une clé de prof compromise permet d'acheter ses cours à un prix arbitraire.
- Recalculer le prix depuis `Course.price` au moment du webhook — rejeté : le prof peut changer son prix entre la création de la session et le paiement ; l'intention fige le prix réellement proposé.
- Idempotence par `event.id` (table d'événements traités) — non retenue pour l'instant : l'idempotence par `stripeSessionId` (unique sur `Purchase`) suffit pour les deux événements traités ; à reconsidérer avec les abonnements (s13).

## Consequences
- Une table et une migration de plus ; une ligne par tentative de paiement, y compris abandonnée (pas de purge au MVP ; les sessions Stripe expirent d'elles-mêmes).
- La page de succès retrouve le prof par l'intention (et non par un `courseId` venu de l'URL), puis vérifie la session chez Stripe.
- Le prix payé est celui de l'intention, même si le prof a modifié son prix entre-temps.
