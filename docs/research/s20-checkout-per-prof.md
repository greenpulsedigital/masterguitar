# Research — Story s20-checkout-per-prof

> Exploration du 2026-10-05, sur `main` à `bd44b7f` (s19 fusionnée jusqu'à la PR #34). Tout ce qui est cité ci-dessous a été ouvert dans le code ; ce qui ne l'a pas été est dans « Questions ouvertes ».

## Target story

**En tant qu'**élève, **je veux** payer sur le compte Stripe du prof **pour que** le prof reçoive 100 % du montant (moins les frais Stripe) sans passer par la plateforme.

Critères d'acceptation (docs/stories.md, story s20) :
1. Le checkout résout le compte uniquement depuis `course.profId`, revalide qu'il est `ACTIVE` et crée la session avec la clé de ce prof ; sinon message clair, aucun appel Stripe, aucun repli sur une clé globale.
2. Webhook reçu sur un endpoint propre au prof ; taille limitée (valeur documentée) avant lecture ; signature vérifiée sur le corps brut avec le secret de ce prof avant tout parsing.
3. `profId` inconnu ou secret absent / invalide → réponse générique qui ne révèle pas l'existence du prof.
4. Après signature : événement refusé si `course.profId !== profId` ; aucun `Purchase` ni `PaymentIssue` écrit (testé).
5. Page de succès : `courseId` n'est qu'un indice ; après récupération de la session sur le compte du prof, vérifier `metadata.courseId`, `metadata.userId`, l'acheteur connecté et le prof du cours ; `session_id` validé (format, longueur) avant tout appel Stripe ; en cas d'écart, aucune donnée du cours affichée.
6. Page de succès : « paiement en attente » tant que le `Purchase` n'existe pas.
7. `PaymentIssue` garde un instantané `profId`, `stripeAccountId`, mode.
8. `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` globales ne sont plus nécessaires au paiement.

Dépendances : s07 (fusionnée, `Ship allowed: no` en attente de s20), s19 (fusionnée ; tâche 12 manuelle partielle). Décisions confirmées le 2026-10-05 : P2 = 72 h, P4 = live en production / test ailleurs, P5 = s19 et s20 déployées ensemble.

## Current state of the code

| Fichier | Rôle aujourd'hui |
|---|---|
| `src/lib/stripe.ts` | Instancie un client **global** au chargement du module ; **lève une erreur à l'import** si `STRIPE_SECRET_KEY` est absente. Version d'API `2026-07-29.dahlia`. Importé par les 3 fichiers ci-dessous et mocké par 5 fichiers de test. |
| `src/app/checkout/actions.ts` | `createCheckoutSession(courseId)` : `auth()`, `getCourseById`, cours `PUBLISHED`, prix > 0, pas son propre cours, pas déjà acheté, puis `stripe.checkout.sessions.create` (mode `payment`, `eur`, `unit_amount: course.price`, `metadata { courseId, userId }`, `success_url = <base>/checkout/success?session_id={CHECKOUT_SESSION_ID}`, `cancel_url = <base>/cours/<slug>`). Erreurs → `{ error }` ; `console.error("Checkout error:", error)` journalise **l'objet erreur Stripe entier**. |
| `src/app/api/webhooks/stripe/route.ts` | `POST` unique : `request.text()` **sans limite de taille**, en-tête `stripe-signature`, secret **global** `STRIPE_WEBHOOK_SECRET` (500 si absent), `stripe.webhooks.constructEvent`. Traite `checkout.session.completed` et `async_payment_succeeded` : `payment_status === "paid"`, metadata, `amount_total > 0`, `currency === "eur"`, `payment_intent`, existence du cours et de l'utilisateur, idempotence par `stripeSessionId`, `P2002` → relecture puis `PaymentIssue` `DUPLICATE_PURCHASE` + log `[PAYMENT_ALERT]`. Signature invalide détectée par `error.message.includes("signature")` → 400 ; autre → 500. **Aucun contrôle du prof du cours.** |
| `src/app/checkout/success/page.tsx` | `session_id` requis (sinon `/`), **aucune validation de format** ; acheteur connecté requis ; `stripe.checkout.sessions.retrieve(session_id)` avec la clé globale ; refuse si `metadata.userId !== user`. « Paiement en attente » décidé par `session.payment_status !== "paid"` — **pas** par l'existence du `Purchase` (critère 6). Branche `already_purchased=true` sans appel Stripe. |
| `src/app/checkout/[courseId]/page.tsx`, `checkout-button.tsx` | N'importent pas Stripe. Appellent l'action. |
| `src/lib/prof-stripe-account.ts` (s19) | `connectAccount`, `getProfStripeStatus`, `markAccountInvalid(profId)` (« utilisé par s20 », ne touche qu'un compte `ACTIVE`), `startDisconnect`, `purgeExpiredDisconnections`. `defaultCreateClient` (non exporté) instancie `new Stripe(key, { apiVersion, typescript: true })`. `safeLog(label, error)` (non exporté) ne journalise que `type`, `code`, `statusCode`. |
| `src/lib/stripe-keys.ts` (s19) | `encryptSecret(plain, ctx)`, `decryptSecret(blob, ctx)` avec `ctx = { profId, mode: "TEST" \| "LIVE", usage: "secret-key" \| "webhook-secret" }` ; AAD = `profId\|mode\|usage\|version` ; toute erreur = même `Error("Stripe secret encryption failure")`. |
| `prisma/schema.prisma` | `ProfStripeAccount` : `profId @unique`, `stripeAccountId`, `mode StripeMode`, `status StripeAccountStatus` (`ACTIVE`/`INVALID`/`DISCONNECTING`), `encryptedSecretKey`, `webhookEndpointId?`, `encryptedWebhookSecret?`, `encryptionKeyVersion`, `reconcileUntil?`, `@@unique([stripeAccountId, mode])`. `PaymentIssue` : `type`, `status`, `stripeSessionId @unique`, `stripePaymentId`, `amount`, `userId`, `courseId` — **pas de `profId`, `stripeAccountId`, mode**, pas de relation. `Purchase` : `stripePaymentId @unique`, `stripeSessionId @unique`, `@@unique([userId, courseId])`. |
| `middleware.ts` | `matcher: ["/dashboard/:path*"]` : les routes `/api/webhooks/**` et `/checkout/**` ne passent pas par le middleware d'auth. |
| `.github/workflows/ci.yml` | `STRIPE_SECRET_KEY: sk_test_ci`, `STRIPE_WEBHOOK_SECRET: whsec_ci`, `STRIPE_KEYS_ENCRYPTION_KEY` factice. |
| `.env.example` | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_KEYS_ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL`. |

Convention suivie de bout en bout (checkout → webhook → page) : Server Action qui renvoie `{ error }` en français et ne lève pas ; route handler qui renvoie des `Response` texte ; page Server Component avec `redirect()` hors `try/catch` ; composants `Card` / `Button` du design system ; Prisma via `@/lib/prisma` ; erreurs Prisma reconnues par `code === "P2002"`.

## Anchor points

- **Nouvelle fabrique** (story : `getStripeForProf(profId)`) — naturellement dans `src/lib/prof-stripe-account.ts`, qui détient déjà `defaultCreateClient`, `decryptSecret` et `safeLog`. Elle doit lire le compte, vérifier le statut attendu selon l'usage (voir pièges), déchiffrer avec le bon `ctx`, instancier sans cache.
- **Checkout** : `src/app/checkout/actions.ts`, remplacer l'import `stripe` par la fabrique ; ajouter `courseId` dans `success_url`.
- **Webhook** : nouveau `src/app/api/webhooks/stripe/[profId]/route.ts` (URL déjà créée chez Stripe par s19 : `<getBaseUrl()>/api/webhooks/stripe/<profId>`, événements `checkout.session.completed`, `checkout.session.async_payment_succeeded`). L'actuel `route.ts` dans le dossier parent peut coexister (segment statique vs dynamique) ou être supprimé (question ouverte 1).
- **Page de succès** : `src/app/checkout/success/page.tsx`.
- **Migration** : `PaymentIssue` + `profId`, `stripeAccountId`, `mode` (dernière migration : `20261004160000_s19_prof_stripe_account`).
- **Config** : `.env.example`, `ci.yml`, `src/lib/stripe.ts` (suppression ou fin de l'erreur à l'import), `src/__tests__/stripe-client.test.ts`.
- **Docs** : ADR 004 (note remboursement → Stripe du prof), `docs/architecture.md` l. 268 (`/api/webhooks/stripe`), plan et revue s07.

## Verified APIs / functions

- SDK `stripe` **22.4.0** (`node_modules/stripe/package.json`).
- `Stripe.webhooks` est **statique** (`cjs/stripe.core.d.ts:136` `static webhooks`) en plus de l'instance (l. 146) : la signature peut être vérifiée **sans instancier de client ni déchiffrer la clé du prof**, avec seulement son secret de webhook.
- `constructEvent(payload, header, secret, tolerance?, cryptoProvider?, receivedAt?) => Event` et `constructEventAsync(...)` (`cjs/Webhooks.d.ts:31-32`) ; tolérance par défaut `DEFAULT_TOLERANCE: 300` secondes (`cjs/Webhooks.js:8`). `constructEvent` (synchrone) lève si le fournisseur crypto est asynchrone (message « Use `await constructEventAsync(...)` », `Webhooks.js:21`) : en runtime Node c'est le synchrone qui sert aujourd'hui.
- Erreurs typées : `StripeAuthenticationError` (`cjs/Error.d.ts:120`), `StripePermissionError` (l. 127), `StripeSignatureVerificationError` (l. 150) — permettent de remplacer `error.message.includes("signature")`.
- `getCourseById(id)` (`src/lib/queries/course.ts:48`) renvoie `{ id, title, slug, price, status, profId }` ou `null`.
- `markAccountInvalid(profId: string): Promise<void>` (`src/lib/prof-stripe-account.ts`) : `updateMany` limité à `status: "ACTIVE"`.
- `decryptSecret(blob, { profId, mode, usage })` (`src/lib/stripe-keys.ts:70`).
- `getBaseUrl()` (`src/lib/app-url.ts`) : `NEXT_PUBLIC_APP_URL` sans `/` final ; lève en production si absente, `http://localhost:3000` sinon.
- Test P1 du 2026-10-05 : une clé restreinte avec `checkout_session_write` **crée et relit** une Checkout Session (la page de succès peut faire `sessions.retrieve` avec la clé du prof).

## Traps & constraints

1. **Statut du compte selon l'usage.** Checkout : `ACTIVE` uniquement (critère 1). Webhook : le secret doit rester utilisable en `DISCONNECTING` (c'est tout l'objet de la fenêtre de 72 h de s19) et probablement en `INVALID` (clé révoquée ≠ secret de webhook révoqué ; des paiements en vol peuvent arriver). Page de succès : la relecture de session a besoin de la clé, donc échoue en `INVALID` et après purge. À trancher au plan ; la fabrique ne peut pas imposer `ACTIVE` partout.
2. **Contrôle cross-prof** (critère 4) : `course.profId === profId` après signature, **avant** toute écriture, y compris `PaymentIssue`. Aujourd'hui le webhook ne sélectionne que `{ id }` du cours.
3. **Mode** : vérifier `event.livemode` contre `account.mode` (un événement test signé ne doit pas accorder un accès en production). Non demandé explicitement par la story ; P4 le rend cohérent.
4. **Réponses indistinguables** (critère 3) : prof inconnu, compte sans secret, déchiffrement impossible, signature invalide → même statut et même corps. Attention au **temps de réponse** (lecture en base + HMAC vs retour immédiat) : risque faible, à noter.
5. **Taille du corps** (critère 2) : `request.text()` lit tout. Il faut lire `content-length` **et** borner la lecture du flux (l'en-tête peut mentir ou manquer). Valeur à documenter : les événements Checkout pèsent quelques Ko ; une borne de l'ordre de 64 à 256 Ko est plausible — **à confirmer**, Stripe ne publie pas de maximum à notre connaissance.
6. **Journalisation** : `console.error("Checkout error:", error)` et `console.error("Webhook error:", error)` journalisent l'objet erreur complet. Avec des clés de profs, réutiliser le principe de `safeLog` (s19) : jamais de message Stripe, jamais de clé ni de secret.
7. **Clé refusée au checkout** : `StripeAuthenticationError` (401) → `markAccountInvalid(profId)` (prévu par s19). `StripePermissionError` (403) : clé valide mais permissions retirées — marquer invalide ou non ? À trancher.
8. **Page de succès / critère 6** : passer de `payment_status` à l'existence du `Purchase` change le sens de l'écran « paiement en attente » (aujourd'hui : moyen de paiement différé ; demain : aussi le délai du webhook). Les 7 tests de `checkout-success.test.tsx` sont à reprendre.
9. **Validation de `session_id`** : format `cs_(test|live)_…` à confirmer ; borner la longueur (les identifiants Checkout dépassent 60 caractères). Ne jamais renvoyer le `session_id` brut dans un message.
10. **`success_url` doit porter `courseId`** pour retrouver le prof avant `retrieve`. `courseId` vient de l'URL : n'être qu'un indice (critère 5), comparé ensuite à `metadata.courseId`.
11. **`src/lib/stripe.ts` lève à l'import** : tant qu'un fichier l'importe, `STRIPE_SECRET_KEY` reste requise (contraire au critère 8). Les 5 mocks `vi.mock("@/lib/stripe")` et `stripe-client.test.ts` (3 tests) sont à supprimer ou réécrire.
12. **Tests existants à reprendre** : `stripe-webhook` (17), `checkout-action` (8), `checkout-success` (7), `checkout-integration` (5), `stripe-client` (3), `checkout-page` (7, mock seulement). Les assertions d'idempotence, `P2002` et `PaymentIssue` de s07 doivent survivre au déplacement.
13. **Purge s19** : `purgeExpiredDisconnections` supprime la ligne du compte en fin de fenêtre ; un webhook arrivé après la purge tombe dans le cas « prof inconnu » (réponse générique). `PaymentIssue` doit donc porter son propre instantané (critère 7) : c'est la raison de ce critère.
14. **Idempotence de création de session** : aucune aujourd'hui (double clic = deux sessions). Hors critères ; à mentionner seulement.
15. **Dépôt public** : fausses clés assemblées à l'exécution dans les tests (`["rk","live",…].join("_")`), comme dans s19 ; GitHub bloque `sk_live_…` littéral.
16. **Déploiement conjoint (P5)** : les endpoints déjà créés par s19 pointent vers `/api/webhooks/stripe/<profId>`, qui renvoie 404 tant que s20 n'est pas déployée ; Stripe réessaie puis peut désactiver l'endpoint.

## Open questions

1. **Ancien endpoint `/api/webhooks/stripe`** : le compte Stripe de la plateforme a-t-il de **vraies ventes** ? En local, `Purchase` et `PaymentIssue` sont vides et l'application n'a jamais été déployée (déploiement de s07 en attente), ce qui suggère « non », mais seul le dashboard Stripe de la plateforme le confirme. Non → supprimer la route et le dire dans la PR ; oui → mode drainage pendant une fenêtre documentée.
2. **Intention de checkout persistée** (story, « à trancher dans le plan ») : table qui fige prof, cours, acheteur, montant, devise, mode, revérifiée par le webhook — ou seulement `amount_total > 0` et `eur` comme aujourd'hui (une clé de prof compromise permet alors de créer une session à 1 centime qui donne accès au cours… de ce même prof seulement, vu le contrôle cross-prof).
3. **Idempotence par `event.id`** (table d'événements traités) en plus de `stripeSessionId` : non requise aujourd'hui.
4. **Statuts acceptés** par le webhook (`INVALID` ?) et par la page de succès (`DISCONNECTING`, `INVALID`) — voir piège 1.
5. **403 au checkout** : marquer le compte `INVALID` ou seulement refuser ? (piège 7)
6. **Borne de taille du corps** et sa justification (piège 5).
7. **Design** : la story touche l'interface (message « ce cours n'est pas encore achetable » côté élève, écran de succès / attente). `docs/designs/s07-stripe-checkout.md` couvre les écrans actuels ; décider si un `/ks-design s20` est nécessaire ou si les écrans s07 suffisent avec des textes ajustés.
8. **Test manuel** : la tâche 12 de s19 n'a pas pu valider une connexion réelle (clé restreinte sans lecture du compte). s20 aura besoin d'un compte prof connecté en test **et** d'une URL publique (tunnel) pour recevoir les webhooks : Stripe refuse les endpoints vers `localhost`.

Research ready in docs/research/s20-checkout-per-prof.md. Next step: /ks-design s20-checkout-per-prof (UI story) or /ks-plan s20-checkout-per-prof

## Réponses de l'utilisateur (2026-10-05)

1. Compte Stripe de la plateforme : **seulement des paiements de test** → supprimer `/api/webhooks/stripe` ; prévenir dans la PR qu'il faut retirer l'endpoint de la plateforme du dashboard Stripe.
2. Intention de checkout persistée : **oui** (ADR 008).
5. 403 au checkout : **marquer le compte `INVALID`**, comme pour un 401.
7. Design : **réutiliser les écrans s07** (seuls les textes changent), pas de `/ks-design s20`.

Les questions 3, 4, 6 et 8 sont tranchées dans le plan.
