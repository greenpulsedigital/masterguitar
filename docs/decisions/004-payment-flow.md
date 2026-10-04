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

- Chaque prof doit configurer ses clés Stripe dans son profil (ou la plateforme a un seul compte Stripe et reverse aux profs — à décider selon le modèle légal).
- Le webhook doit être idempotent : si appelé deux fois, ne pas créer deux `Purchase`.
- L'accès est vérifié via `Purchase` (one-shot) ou `Subscription.status === ACTIVE` (abo).
- Les remboursements sont gérés manuellement dans Stripe Dashboard pour le MVP.
- Les doubles paiements sont enregistrés dans `PaymentIssue` et alertés par log ; le remboursement est effectué manuellement dans Stripe Dashboard, puis l'issue passe au statut `RESOLVED`.
