# ADR 009 — Recentrage v2 : abonnement professeur, fin de la vente aux élèves

- Status: accepted
- Date: 2026-10-29
- Scope: framing
- Supersedes: ADR 004 (flux de paiement), ADR 008 (intention de checkout)

## Context
Le dossier produit v2.0 du 29 octobre 2026 (`Riff-Club-Dossier-Produit`, orientation confirmée par David) change le modèle économique et le cœur du produit. masterguitar n'est plus une alternative à Podia qui vend des cours vidéo aux élèves : c'est une plateforme calme où chaque professeur anime des espaces de cours privés (parcours structurés, devoirs audio commentés, métronome partagé), avec une navigation qui reprend les repères de Discord.

Conséquences directes sur l'existant :
- ADR 004 organisait la vente aux élèves (one-shot et abonnement élève) sur le compte Stripe du prof, sans Connect. s07 (checkout, `Ship allowed: no`) et s19 (connexion du compte Stripe du prof) sont fusionnées dans `main` ; s20 (checkout sur le compte du prof, ADR 008) était planifiée mais non commencée.
- Le dossier v2 retire du MVP la vente de cours aux élèves, la commission, Stripe Connect et l'hébergement vidéo premium. Le professeur paie un abonnement logiciel ; l'élève ne paie rien à la plateforme.

## Decision
1. **Le seul flux de paiement du MVP est l'abonnement du professeur** : Stripe Checkout en mode `subscription` sur le compte Stripe **de la plateforme**, portail client Stripe, webhooks signés, plan effectif calculé au serveur à partir d'un catalogue de plans versionné. Un plan gratuit existe sans carte bancaire.
2. **La vente aux élèves est gelée, pas supprimée** : le code de s07 et s19 reste dans `main` (historique, tests) mais n'est relié à aucun parcours du nouveau MVP. Aucune nouvelle story ne s'appuie sur `Purchase`, `PaymentIssue`, `ProfStripeAccount`, `/checkout/*`, `/cours/[slug]` ni `/dashboard/settings/payments`. Leur retrait éventuel fera l'objet d'une story dédiée, après vérification qu'aucune donnée réelle n'en dépend (jamais de `DROP` aveugle).
3. **s20 est abandonnée** et ADR 008 devient sans objet. Le worktree `masterguitar-s20` et la branche locale `feature/s20-checkout-per-prof` (identique à `main`, aucun commit) ont été retirés le 2026-10-29.
4. ADR 005 (vidéo externe par URL) reste valable dans un périmètre réduit : une URL vidéo peut être une **ressource** d'étape, sans prétendre en protéger l'accès ; aucun pipeline vidéo n'est construit.

## Considered options
- Finir s20 en parallèle du nouveau MVP — rejeté : contredit le dossier v2 et consomme l'effort sur un flux que le pilote n'utilisera pas.
- Retirer tout de suite le code de vente élève (modèles, migrations, routes) — rejeté pour l'instant : suppression réelle, non nécessaire pour avancer, et qui mérite sa propre story avec vérification des données.
- Garder ADR 004 et ajouter l'abonnement prof à côté — rejeté : deux modèles de paiement concurrents rendraient la facturation et les quotas ambigus.

## Consequences
- La plateforme redevient détentrice du compte Stripe encaissant (abonnements des profs) : `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` plateforme reviennent dans le contrat d'environnement, distincts de `STRIPE_KEYS_ENCRYPTION_KEY` (s19, gelée).
- La garde de publication de s19 (`toggleCourseStatus` refuse sans compte Stripe `ACTIVE`) ne s'applique qu'aux anciens cours gelés ; les parcours v2 ne passent pas par elle.
- Les revues `s07` (`Ship allowed: no`) et `s19` (en cours) restent en l'état : elles ne bloquent plus le MVP.
- À surveiller : ne pas réutiliser par commodité `Course` / `Purchase` pour les espaces v2 ; la correspondance éventuelle est tranchée dans la recherche de la story parcours.
