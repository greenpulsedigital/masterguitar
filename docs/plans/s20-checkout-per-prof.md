---
validated: no
---
# Plan — Story s20-checkout-per-prof

Branch: `feature/s20-checkout-per-prof`

## Target story

**En tant qu'**élève **je veux** payer sur le compte Stripe du prof **pour que** le prof reçoive 100 % du montant (moins les frais Stripe) sans passer par la plateforme.

Critères d'acceptation : voir `docs/stories.md` (8 critères) et `docs/research/s20-checkout-per-prof.md`. Complexité 3. Dépend de s07 et s19 (fusionnées). s19 et s20 se déploient **ensemble** (P5).

## Décisions de plan

1. **Intention de checkout persistée** (ADR 008) : table `CheckoutIntent`, créée avant l'appel Stripe, revérifiée par le webhook et la page de succès.
2. **Écart assumé avec la story** : `success_url` porte l'identifiant de l'**intention** (`intent=<id>`) au lieu du `courseId`. L'intention donne le prof, le cours et l'acheteur attendus ; elle reste un simple indice, puisque la session est ensuite relue chez Stripe et comparée champ par champ (critère 5 tenu).
3. **Statut du compte selon l'usage** :
   - checkout : `ACTIVE` uniquement ;
   - webhook : tout compte encore présent avec un secret (`ACTIVE`, `INVALID`, `DISCONNECTING`), car le secret de webhook reste valable quand la clé est révoquée ou pendant la fenêtre de 72 h ;
   - page de succès : tout compte présent dont la clé se déchiffre ; si Stripe refuse la relecture, écran générique sans donnée du cours.
4. **401 ou 403 de Stripe au checkout** → `markAccountInvalid(profId)` puis message générique (choix de l'utilisateur).
5. **Taille maximale du corps du webhook : 256 Kio.** Un événement Checkout pèse quelques Kio ; la borne laisse une marge large sans permettre de saturer la mémoire. Vérifiée sur `content-length` **et** pendant la lecture du flux (l'en-tête peut manquer ou mentir). Au-delà : 413, avant toute lecture de base.
6. **Réponse générique du webhook** : prof inconnu, compte sans secret, déchiffrement impossible, signature invalide, événement d'un autre mode → **même statut 400, même corps `Invalid request`**.
7. **Mode** : un événement dont `livemode` ne correspond pas au `mode` du compte est refusé comme une signature invalide.
8. **Pas d'idempotence par `event.id`** (ADR 008) ; l'idempotence par `stripeSessionId` de s07 est conservée.
9. **Ancienne route `/api/webhooks/stripe` supprimée** : le compte de la plateforme n'a que des paiements de test (réponse de l'utilisateur). La PR rappelle de retirer l'endpoint de la plateforme du dashboard Stripe.
10. **Écrans** : ceux de s07 (`Card`, `Button`), seuls les textes changent ; aucun composant nouveau.

## Tasks (ordered)

### 1. [ ] Modèle de données — migration `s20_checkout_per_prof`
- `CheckoutIntent` : `id` (cuid), `profId`, `stripeAccountId`, `mode StripeMode`, `courseId`, `userId`, `amount Int`, `currency String`, `stripeSessionId String? @unique`, `createdAt`. Index sur `profId`. Pas de relation `onDelete: Cascade` vers le compte Stripe (l'intention survit à la purge de s19).
- `PaymentIssue` : ajout de `profId String?`, `stripeAccountId String?`, `mode StripeMode?` (nullable : lignes de s07 existantes).
- **Tests** : couverts par les tâches 3 et 5 (création d'intention, instantané dans `PaymentIssue`) ; `prisma validate` et `prisma migrate dev` passent.

### 2. [ ] Accès Stripe par prof — `src/lib/prof-stripe-account.ts`
- `getStripeForProf(profId, { allowedStatuses })` : lit le compte, refuse si statut non autorisé, déchiffre la clé (`usage: "secret-key"`), instancie avec la même version d'API, **sans cache** ; renvoie `{ stripe, account }` ou `null` (aucune cause distinguée).
- `getWebhookSecretForProf(profId)` : secret déchiffré (`usage: "webhook-secret"`) et `mode`, ou `null` si compte absent, sans secret ou indéchiffrable.
- `handleStripeKeyFailure(profId, error)` : 401 (`StripeAuthenticationError`) ou 403 (`StripePermissionError`) → `markAccountInvalid` ; journalisation via `safeLog`.
- Le type `StripeClientLike` s'étend de `checkout.sessions.create` et `retrieve` ; la fabrique reste injectable pour les tests.
- **Tests** : statut refusé, compte absent, clé indéchiffrable → `null` ; client créé avec la clé déchiffrée ; pas de cache entre deux appels ; 401 et 403 → compte `INVALID`, 500 ou réseau → inchangé ; aucune clé ni secret dans `console`.

### 3. [ ] Checkout — `src/app/checkout/actions.ts`
- Après les contrôles existants : compte du prof via `course.profId` uniquement, `ACTIVE` requis, sinon `{ error: "Ce cours n'est pas encore disponible à l'achat" }` **sans appel Stripe**.
- Création de l'intention (montant = `course.price`, `eur`), puis session avec la clé du prof : `metadata { courseId, userId, intentId }`, `success_url = <base>/checkout/success?intent=<intentId>&session_id={CHECKOUT_SESSION_ID}`, `cancel_url` inchangé ; enregistrement du `stripeSessionId` sur l'intention.
- Erreur Stripe : `handleStripeKeyFailure`, message générique ; la journalisation ne passe plus l'objet erreur brut.
- **Tests** : reprise des 8 tests de `checkout-action` ; prof sans compte / `INVALID` / `DISCONNECTING` → message, aucun appel Stripe ; client créé avec la clé du prof et jamais une clé globale ; intention créée avec le bon montant puis complétée du `stripeSessionId` ; 401 et 403 → compte `INVALID` ; aucune clé dans les logs.

### 4. [ ] Webhook par prof : réception — `src/app/api/webhooks/stripe/[profId]/route.ts`
- Borne de 256 Kio (`content-length` puis lecture bornée du flux) → 413.
- Secret via `getWebhookSecretForProf`, signature vérifiée avec `Stripe.webhooks.constructEvent` (statique, aucune clé de prof déchiffrée) sur le corps brut, avant tout `JSON.parse` ; `livemode` comparé au mode du compte.
- Toute cause d'échec → 400 `Invalid request` identique ; erreurs reconnues par `StripeSignatureVerificationError` et non par le texte du message.
- **Tests** (en-têtes signés avec `Stripe.webhooks.generateTestHeaderString`) : corps trop gros (avec et sans `content-length`) → 413 sans lecture de base ; prof inconnu, compte sans secret, signature fausse, mauvais mode → réponses strictement identiques ; signature valide → traitement appelé.

### 5. [ ] Webhook par prof : traitement — module `src/lib/checkout-webhook.ts`
- Logique de s07 déplacée : `payment_status === "paid"`, `async_payment_succeeded`, `payment_intent`, idempotence par `stripeSessionId`, `P2002` → relecture puis `PaymentIssue`.
- Nouveaux contrôles **avant toute écriture** : cours existant et `course.profId === profId` (critère 4) ; intention `metadata.intentId` existante et identique à la session (prof, compte et mode, cours, acheteur, `amount_total`, devise, `stripeSessionId`). Écart → 200 acquitté sans rien écrire (Stripe ne doit pas réessayer un événement refusé) et log `safeLog`.
- `PaymentIssue` avec instantané `profId`, `stripeAccountId`, `mode` (critère 7).
- **Tests** : les 17 tests de `stripe-webhook` repris ; **cross-prof** (événement signé par le prof A pour un cours du prof B) → aucun `Purchase` ni `PaymentIssue` ; intention absente, montant ou acheteur différent → rien écrit ; instantané présent dans `PaymentIssue`.

### 6. [ ] Page de succès — `src/app/checkout/success/page.tsx`
- `intent` et `session_id` validés (format `cs_(test|live)_[A-Za-z0-9]+`, longueur ≤ 255 ; identifiant d'intention au format cuid) **avant** tout appel ; acheteur connecté = `intent.userId`.
- Session relue avec `getStripeForProf(intent.profId)` ; vérifie `session.id === intent.stripeSessionId`, `metadata.courseId`, `metadata.userId`, et le prof du cours. Tout écart ou échec Stripe → écran générique, **aucune donnée du cours**.
- « Paiement en attente » tant qu'aucun `Purchase` n'existe pour cet acheteur et ce cours (critère 6), succès sinon.
- **Tests** : reprise des 7 tests de `checkout-success` ; `session_id` malformé ou trop long → aucun appel Stripe ; intention d'un autre acheteur ; session d'un autre cours ; `Purchase` absent → attente même si `payment_status === "paid"` ; présent → succès.

### 7. [ ] Retrait de la configuration Stripe globale
- Suppression de `src/lib/stripe.ts`, `src/app/api/webhooks/stripe/route.ts`, `stripe-client.test.ts`, des `vi.mock("@/lib/stripe")` restants ; `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` retirées de `.env.example` et de `ci.yml` (seule reste la fausse clé de chiffrement).
- Docs : `docs/architecture.md` (route des webhooks), ADR 004 (note : remboursement d'un double paiement dans le Stripe **du prof**, via l'instantané de `PaymentIssue`).
- **Tests** : `grep` sans résultat sur `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` dans `src/` ; build passant sans ces variables.

### 8. [ ] Vérification finale et clôture de s07
- `npx tsc --noEmit`, `npm run lint` (0 erreur), `npx vitest run`, `npm run build` sans variable Stripe globale ; balayage des secrets du diff (`rk_`, `sk_`, `whsec_`, `acct_`, `cs_live`).
- **Vérification manuelle** (avec la tâche 12 de s19) : tunnel HTTPS public, compte prof de test connecté, achat par carte de test, `Purchase` créé, page de succès, cours bloqué après déconnexion du prof. À consigner dans la revue.
- Après la revue : cocher le critère « 100 % » du plan s07, relancer la re-revue s07 pour lever `Ship allowed: no`.

## Files touched

- `prisma/schema.prisma`, `prisma/migrations/<date>_s20_checkout_per_prof/`
- `src/lib/prof-stripe-account.ts`, nouveau `src/lib/checkout-webhook.ts`
- `src/app/checkout/actions.ts`, `src/app/checkout/success/page.tsx`
- nouveau `src/app/api/webhooks/stripe/[profId]/route.ts` ; supprimés `src/app/api/webhooks/stripe/route.ts`, `src/lib/stripe.ts`
- tests : `prof-stripe-account`, `checkout-action`, `checkout-success`, `checkout-integration`, `checkout-page`, `stripe-webhook` (réécrit pour la route par prof), nouveau `checkout-webhook` ; supprimé `stripe-client`
- `.env.example`, `.github/workflows/ci.yml`, `docs/architecture.md`, `docs/decisions/004-payment-flow.md`, `docs/decisions/008-checkout-intent.md`

## Test strategy

| Niveau | Cible | Approche |
|---|---|---|
| Service | `getStripeForProf`, `getWebhookSecretForProf`, `handleStripeKeyFailure` | Prisma en mémoire comme s19, fabrique de client injectée |
| Action | `createCheckoutSession` | Prisma et fabrique mockés, aucun réseau |
| Route | `POST /api/webhooks/stripe/[profId]` | Vraie vérification de signature (`generateTestHeaderString`) avec des secrets factices |
| Module | traitement des événements | Prisma mocké, cas cross-prof et intention |
| Page | succès | React Testing Library, Stripe mocké |
| Intégration | checkout → webhook → page | Enchaînement mocké de bout en bout (`checkout-integration`) |

Aucun appel Stripe réel en CI ; fausses clés assemblées à l'exécution (dépôt public).

## Definition of Done

- [ ] Les 8 tâches sont terminées et cochées, les 8 critères d'acceptation vérifiés
- [ ] Cas cross-prof testé : aucun `Purchase` ni `PaymentIssue`
- [ ] Aucune variable Stripe globale nécessaire ; build sans elles
- [ ] `tsc`, lint, tests et build passent en CI
- [ ] Aucun secret dans le dépôt, les logs, les réponses ni le DOM
- [ ] Vérification manuelle avec un compte Stripe de test et un tunnel consignée dans la revue
- [ ] Revue `docs/reviews/s20-checkout-per-prof.md` : aucun problème critique ; re-revue s07 relancée
