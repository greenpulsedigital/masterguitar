# ADR 004 — Flow de paiement

- Status: accepted
- Date: 2026-07-31
- Scope: framing

## Context

L'angle principal de MasterGuitar est **commission 0%** — le prof garde 100% de ses ventes (moins les frais Stripe ~2.9%). Le modèle économique repose sur un abonnement fixe payé par le prof pour utiliser la plateforme.

Deux modes de vente :
1. **One-shot** : l'élève paie une fois, accès permanent
2. **Abonnement** : l'élève paie chaque mois, accès tant que l'abo est actif

## Decision

- **Stripe Checkout** (hosted) pour le MVP — pas de formulaire de carte custom
- **Stripe Subscriptions** pour les abonnements récurrents
- **Webhooks** pour confirmer les paiements et créer les accès
- **Pas de Stripe Connect** : chaque prof configure son propre compte Stripe

### Flow one-shot
1. Élève clique "Acheter" sur la page de vente
2. Redirect vers Stripe Checkout avec le prix du cours
3. Paiement réussi → webhook `checkout.session.completed`
4. Webhook crée `Purchase` en base → élève a accès
5. Redirect vers page de confirmation

### Flow abonnement
1. Élève clique "S'abonner" sur la page de vente
2. Redirect vers Stripe Checkout en mode subscription
3. Paiement réussi → webhook `customer.subscription.created`
4. Webhook crée `Subscription` en base avec status `ACTIVE`
5. Chaque mois, Stripe charge automatiquement
6. Si annulation → webhook `customer.subscription.deleted` → status `CANCELED` → accès révoqué

## Considered options

- **Stripe Checkout** — retenu. Hosted, PCI compliant, moins de code, moins de risques.
- Stripe Elements — rejeté pour MVP. Plus de contrôle mais plus de travail, erreurs de validation à gérer.
- Stripe Connect — rejeté. Ajoute 0.5% + complexité onboarding. Chaque prof a son Stripe, la plateforme ne touche pas l'argent.

## Consequences

- **Décision (2026-10-04) : un compte Stripe par prof, sans Stripe Connect.** La plateforme n'encaisse pas l'argent : chaque prof configure son propre compte Stripe dans son profil, et le checkout d'un cours est créé avec le compte du prof de ce cours. L'hypothèse d'un compte plateforme qui reverse aux profs est écartée.
- **État du code : non implémenté.** Le checkout et le webhook utilisent aujourd'hui une seule clé globale (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`), donc l'argent arrive sur le compte de la plateforme. Cet écart bloque la livraison de s07 (voir `docs/reviews/s07-stripe-checkout.md`) et fait l'objet de deux stories : `s19-prof-stripe-account` (connexion du compte du prof) et `s20-checkout-per-prof` (paiements et webhooks sur ce compte).
- **Points à cadrer dans cette story** : stockage chiffré des clés du prof (jamais renvoyées au client), vérification de la clé à la saisie, résolution du compte au checkout (clé du `profId` du cours), un secret de webhook par prof et un endpoint capable d'identifier le prof avant de vérifier la signature, comportement tant qu'un prof n'a pas configuré Stripe (cours non achetable), et prise en charge du statut des abonnements.
- Le webhook doit être idempotent : si appelé deux fois, ne pas créer deux `Purchase`.
- L'accès est vérifié via `Purchase` (one-shot) ou `Subscription.status === ACTIVE` (abo).
- Les remboursements sont gérés manuellement dans Stripe Dashboard pour le MVP.
- Les doubles paiements sont enregistrés dans `PaymentIssue` et alertés par log ; le remboursement est effectué manuellement dans Stripe Dashboard, puis l'issue passe au statut `RESOLVED`.
- **Déconnexion d'un compte Stripe de prof (s19)** : elle bloque tout de suite les nouveaux checkouts et publications, mais l'endpoint webhook, la clé et le secret restent chiffrés pendant une fenêtre de réconciliation (72 h proposées) pour traiter les événements en vol. À la fin de la fenêtre, l'endpoint est supprimé chez Stripe (au mieux) et les secrets effacés. Supprimer l'endpoint dès la déconnexion rendrait la conservation du secret inutile, puisqu'il ne recevrait plus d'événements.
