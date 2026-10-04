---
validated: no
---
# Plan — Story s19-prof-stripe-account

Branch: `feature/s19-prof-stripe-account`

## Target story

**As a** prof **I want** connecter mon propre compte Stripe **so that** les paiements de mes élèves arrivent directement chez moi, sans passer par la plateforme.

### Acceptance criteria
- [ ] Le prof peut saisir sa clé API Stripe depuis `/dashboard/settings/payments` (clé restreinte recommandée, permissions minimales indiquées dans l'interface)
- [ ] La saisie est contrôlée localement (format, longueur maximale) puis vérifiée auprès de Stripe ; toute clé refusée donne le même message générique, sans détail Stripe ni identifiant de compte
- [ ] Les actions de connexion et de déconnexion exigent le rôle `PROF` vérifié en base, sont limitées en débit par utilisateur et par adresse IP, et ne permettent à un prof de gérer que son propre compte
- [ ] Le `stripeAccountId` est enregistré et unique par mode : un même compte Stripe ne peut pas être lié à deux profs
- [ ] Chaque secret est chiffré en AES-256-GCM (IV unique, tag, données associées `profId` / mode / usage / version) ; toute incohérence fait échouer le déchiffrement, sans repli
- [ ] Aucun secret en clair dans les logs, erreurs, props, cookies, URL ou résultats de Server Actions ; seuls les 4 derniers caractères et le mode sont affichés
- [ ] À la connexion, un endpoint webhook est créé de façon idempotente ; son secret est chiffré immédiatement ; si l'enregistrement échoue, l'endpoint créé est supprimé
- [ ] La déconnexion passe par un état intermédiaire avec fenêtre de réconciliation
- [ ] Un prof sans compte `ACTIVE` ne peut pas publier un cours (vérification atomique dans `toggleCourseStatus`) et voit pourquoi
- [ ] Le statut du compte est visible dans le dashboard

Sources : `docs/stories.md` (s19, s20), `docs/research/s19-prof-stripe-account.md`, `docs/designs/s19-prof-stripe-account.md` (+ `.html`), `docs/decisions/004-payment-flow.md`.

## Prérequis et hypothèses (à lever avant de marquer le plan `validated: yes`)

| # | Sujet | État | Effet sur le plan |
|---|-------|------|-------------------|
| P1 | **Ensemble minimal de permissions d'une clé restreinte** (lecture/suppression d'un endpoint, relecture d'une session) | **Non établi.** Confirmés : `connected_account_read`, `checkout_session_write`, `webhook_write`. Test reporté (script : `scripts/check-stripe-restricted-key.sh`). | Bloque la tâche 6 (gestion du webhook) et le texte de la liste de permissions de la tâche 8. Les tâches 1 à 5 peuvent démarrer. Si une opération webhook est refusée avec une clé restreinte : arrêter, écrire un ADR qui remplace le n° 004, bascule vers Connect Standard OAuth (la fiche interdit de contourner avec une clé complète). |
| P2 | **Durée de la fenêtre de réconciliation** | **Proposition : 72 h**, constante `DISCONNECT_RECONCILIATION_HOURS`. À confirmer, notamment la durée de reprise des livraisons de webhook par Stripe (**À VÉRIFIER** dans la doc Stripe). | Une seule constante à changer. |
| P3 | **Hébergeur** | Non choisi. | La clé de chiffrement vit dans une variable d'environnement (MVP) ; le stockage définitif est repoussé (voir « Hors périmètre »). |
| P4 | **Clés test / live par environnement** | **Proposition** : production = clés `rk_live_` uniquement ; hors production = clés `rk_test_` uniquement. | Contrôle local avant tout appel Stripe, message générique identique. |
| P5 | **Livraison conjointe avec s20** | Décision de plan. | Les endpoints webhook créés par s19 pointent vers `/api/webhooks/stripe/<profId>`, route livrée par s20 ; et le blocage de publication de s19 n'a de sens que si le checkout utilise le compte du prof. **s19 et s20 sont fusionnables séparément mais ne doivent pas être déployés en production l'un sans l'autre.** |

## Décisions de plan (écarts assumés avec la story et le design)

1. **L'endpoint webhook est supprimé chez Stripe à la fin de la fenêtre de réconciliation, pas à la déconnexion.** La story dit « supprimé côté Stripe (au mieux) » puis « secret conservé pendant la fenêtre » : or un endpoint supprimé ne reçoit plus d'événements, donc garder son secret ne servirait à rien. On garde donc, pendant la fenêtre, l'endpoint et son secret (pour traiter les événements en vol, côté s20) et la clé (nécessaire pour supprimer l'endpoint à la fin). À la fin : suppression de l'endpoint (au mieux), effacement de la clé et du secret, suppression de la ligne. Le texte de la story et du dialog de déconnexion du design seront alignés.
2. **Pas de tâche planifiée dans le dépôt.** Le nettoyage de fin de fenêtre (`purgeExpiredDisconnections`) s'exécute paresseusement : au chargement de la page de réglages, à la connexion et à la lecture du statut. Un déclencheur périodique viendra avec l'hébergeur retenu.
3. **Un prof = un compte Stripe** (`profId` unique). Connexion permise sans compte existant ou si le compte est `INVALID` (remplacement de clé) ; refusée en `ACTIVE` (il faut d'abord déconnecter) et en `DISCONNECTING`.
4. **La partie « vente indisponible » du checkout élève** (écran 5 du design) est livrée par s20 : tant que le checkout utilise la clé globale, un blocage côté élève serait incohérent. s19 fournit l'helper de statut que s20 consommera.
5. **Mode = préfixe de la clé** (`rk_test_` / `rk_live_`) : confirmé par les tests, l'objet compte n'a pas de champ `livemode`.
6. **Données du compte Stripe** : seuls `stripeAccountId`, le mode et le statut sont conservés ; email, profil d'entreprise et pays renvoyés par la lecture du compte sont ignorés et jamais journalisés.

## Tasks (ordered)

Chaque tâche : tests d'abord, puis code, puis `npx tsc --noEmit`, `npm run lint` et `npx vitest run`. La CI est bloquante (`Types, tests and build`, `Lint`) et aucun test n'appelle Stripe ni ne contient de vraie clé.

### 1. [x] Modèles `ProfStripeAccount` et `RateLimit`
- Enums `StripeMode { TEST LIVE }` et `StripeAccountStatus { ACTIVE INVALID DISCONNECTING }`.
- `ProfStripeAccount` : `id`, `profId` (unique, relation vers `User`), `stripeAccountId`, `mode`, `status`, `keyLast4`, `encryptedSecretKey`, `webhookEndpointId?`, `encryptedWebhookSecret?`, `encryptionKeyVersion Int`, `reconcileUntil DateTime?`, `createdAt`, `updatedAt` ; `@@unique([stripeAccountId, mode])`.
- `RateLimit` : `key` (ex. `connect:user:<id>`, `connect:ip:<ip>`), `windowStart`, `count` ; `@@id([key, windowStart])`.
- Migration `s19_prof_stripe_account`, vérifiée avec `prisma migrate diff` (aucune différence entre migrations et schéma) puis `prisma generate`.
- **Test** : le schéma compile ; test d'unicité `(stripeAccountId, mode)` et `profId` sur Prisma mocké comme les tests de modèle existants.

### 2. [x] Chiffrement des secrets — `src/lib/stripe-keys.ts`
- `encryptSecret(plain, { profId, mode, usage })` et `decryptSecret(blob, { profId, mode, usage })`, `usage` ∈ `secret-key` | `webhook-secret`.
- AES-256-GCM via `node:crypto`, IV de 12 octets aléatoire **par chiffrement**, format `v<version>:iv:tag:ciphertext` (base64), données associées `profId|mode|usage|version`.
- Clé de 32 octets en base64 dans `STRIPE_KEYS_ENCRYPTION_KEY` (version 1) ; autres versions lues dans `STRIPE_KEYS_ENCRYPTION_KEY_V<n>`. Variable absente ou de mauvaise longueur : erreur au premier usage, jamais de repli.
- Échec fermé : tag, IV, version ou données associées incohérents lèvent une erreur générique **sans** contenu du secret.
- **Tests** : aller-retour ; deux chiffrements du même texte donnent des blobs différents (IV unique) ; changement de `profId`, de mode, d'usage ou de version fait échouer ; blob altéré fait échouer ; clé absente / trop courte ; l'erreur ne contient pas le clair.

### 3. [x] Limitation de débit — `src/lib/rate-limit.ts`
- `checkRateLimit(key, { max, windowSeconds })` basé sur la table `RateLimit` (fenêtre fixe), compatible avec plusieurs instances.
- Seuils de départ, constantes nommées : **5 tentatives / 15 min par utilisateur, 20 / h par adresse IP**. Adresse IP lue dans `x-forwarded-for` (premier élément) ; valeur absente = seau `unknown`. Dépend de l'hébergeur (proxy de confiance) : à noter dans le code.
- **Tests** : sous le seuil OK, au-dessus refusé, nouvelle fenêtre réinitialise, clés indépendantes.

### 4. [x] Rôle `PROF` relu en base — `src/lib/require-prof.ts`
- `requireProf()` : `auth()`, puis lecture de l'utilisateur en base ; refuse si absent ou `role !== "PROF"`. Retourne `{ userId }`. À utiliser pour toutes les actions de s19 (le JWT peut être périmé).
- **Tests** : sans session, rôle STUDENT en base alors que le JWT dit PROF, utilisateur supprimé, PROF valide.

### 5. [x] Service du compte Stripe du prof — `src/lib/prof-stripe-account.ts`
- `parseRestrictedKey(raw, env)` : trim, longueur maximale, motif `^rk_(test|live)_[A-Za-z0-9]+$`, mode dérivé du préfixe, règles P4 ; toute clé `sk_` ou invalide donne le même résultat « refusée ».
- Client Stripe par clé via une fabrique injectable (`createStripeClient(key)`), pour tester sans réseau ; même version d'API que `src/lib/stripe.ts`.
- `connectAccount({ profId, rawKey })` : (1) analyse locale, (2) lecture du compte Stripe pour obtenir `stripeAccountId` (tout échec Stripe = refus générique), (3) refus générique si `(stripeAccountId, mode)` appartient à un autre prof, (4) création de l'endpoint webhook (tâche 6), (5) chiffrement puis enregistrement du compte, du secret de webhook et des 4 derniers caractères en **une** transaction ; si l'étape 5 échoue, suppression de l'endpoint créé (au mieux).
- `getProfStripeStatus(profId)` → `NOT_CONFIGURED | ACTIVE | INVALID | DISCONNECTING` ; `markAccountInvalid(profId)` (consommé par s20 sur un 401 de Stripe).
- `startDisconnect(profId)` : statut `DISCONNECTING`, `reconcileUntil = now + DISCONNECT_RECONCILIATION_HOURS`. `purgeExpiredDisconnections()` : pour chaque compte échu, suppression de l'endpoint (au mieux, erreur journalisée sans secret), effacement et suppression de la ligne.
- **Tests (Stripe mocké)** : clé valide, clé `sk_` / live en dev / test en prod refusées, erreur Stripe quelconque (401, 403, 429, réseau) = même refus, compte déjà lié à un autre prof refusé, échec d'enregistrement supprime l'endpoint, connexion refusée en `ACTIVE` / `DISCONNECTING` et permise en `INVALID`, déconnexion puis purge avant / après l'échéance, aucune valeur de clé dans les erreurs ni dans les appels à `console`.

### 6. [ ] Endpoint webhook du prof — dans `prof-stripe-account.ts` **(bloquée par P1)**
> **État** : la création de l'endpoint (paramètres, clé d'idempotence, chiffrement immédiat du secret, erreur si le secret est absent, nettoyage si l'enregistrement échoue) et la suppression au mieux (remplacement de clé, fin de fenêtre) sont **faites dans la tâche 5** et testées. Restent, **bloquées par P1** : la réutilisation d'un endpoint déjà existant (lecture/liste) et le comportement exact si une clé restreinte ne peut pas supprimer un endpoint.
- Création : `webhookEndpoints.create` avec `url = <getBaseUrl()>/api/webhooks/stripe/<profId>`, événements `checkout.session.completed` et `checkout.session.async_payment_succeeded`, clé d'idempotence stable `webhook:<profId>:<mode>`. Le `secret` n'est renvoyé qu'à la création : le chiffrer immédiatement, ne jamais le journaliser, et traiter une réponse sans secret comme une erreur de provisioning.
- Réutilisation d'un endpoint identique existant, suppression : **opérations de lecture et de suppression soumises à P1**. Si une clé restreinte ne peut pas les faire, le comportement (message générique, nettoyage manuel documenté) est décidé avec le résultat de P1 avant d'écrire cette tâche.
- **Tests (Stripe mocké)** : paramètres exacts de création, secret chiffré avant tout autre traitement, réponse sans secret = erreur, retry n'ouvre pas un second endpoint.

### 7. [ ] Server Actions — `src/app/(dashboard)/dashboard/settings/payments/actions.ts`
- `connectStripeAccount(formData)` et `disconnectStripeAccount()` : `requireProf()`, limitation de débit, Zod, appels au service ; `redirect()` **après** le `try/catch` ; retours limités à `{ error: <message générique> }` (jamais la clé, jamais un message Stripe) ; `revalidatePath` du dashboard et de la page de réglages.
- Messages génériques : clé refusée / indisponible (identiques), trop de tentatives, erreur inattendue.
- **Tests** : non connecté, STUDENT, rate limit atteint, clé refusée pour chaque cause = même message, succès redirige, la valeur saisie n'apparaît dans aucun retour ni log, un prof ne peut déconnecter que son propre compte.

### 8. [ ] Page `/dashboard/settings/payments` — selon le design
- Server Component qui lit le statut (après `purgeExpiredDisconnections`) et rend, avec les composants du design system uniquement : non configuré (formulaire `type="password"`, `autocomplete="off"`, avertissement contre les clés `sk_`, liste des permissions minimales **conforme au résultat de P1**), connecté (Badge TEST / LIVE, 4 derniers caractères, bouton Déconnecter), clé invalide (remplacement), déconnexion en cours (actions désactivées, explication).
- Composants client : formulaire de connexion (état de chargement, erreur `role="alert"` / `aria-live`, jamais de réaffichage de la clé) et dialog de confirmation de déconnexion.
- Cibles tactiles 44 px (`min-h-11`), pas de modification des primitives `Button` / `CardTitle`.
- **Tests (React Testing Library)** : un test par état, champ en `type="password"`, message d'erreur annoncé, clé jamais présente dans le DOM après enregistrement, dialog (ouverture, annulation, confirmation).

### 9. [ ] Dashboard : statut et navigation
- Carte « Paiements » sur `/dashboard` avec le statut du compte et un lien vers les réglages ; entrée de navigation si le header du dashboard en possède une.
- **Tests** : rendu de chaque statut.

### 10. [ ] Blocage de publication
- `toggleCourseStatus` : lorsque le passage se fait vers `PUBLISHED`, vérifier **dans la même transaction que la mise à jour** que le prof a un compte `ACTIVE` ; sinon retourner une erreur explicite. Le passage vers `DRAFT` reste toujours permis.
- Page d'édition du cours : message avec lien vers `/dashboard/settings/payments` quand le prof n'a pas de compte `ACTIVE` (design, écran 4).
- **Tests** : publication sans compte refusée, avec compte `INVALID` / `DISCONNECTING` refusée, avec compte `ACTIVE` permise, dépublication permise sans compte, le message de la page d'édition.

### 11. [ ] Configuration, CI et documentation
- `.env.example` : `STRIPE_KEYS_ENCRYPTION_KEY` avec la commande de génération (`openssl rand -base64 32`) et la mention « ne jamais commiter ».
- `.github/workflows/ci.yml` : fausse clé de chiffrement de test (valeur factice, dépôt public). Aucune vraie clé nulle part.
- Documenter dans l'ADR 004 la décision n° 1 (fin de fenêtre) et aligner la story s19 et le design (dialog de déconnexion).

### 12. [ ] Vérification finale
- `npx tsc --noEmit`, `npm run lint` (0 erreur), `npx vitest run`, `npm run build`.
- Recherche de secrets dans le diff (motifs `rk_`, `sk_`, `whsec_`, `acct_`).
- **Vérification manuelle** avec un compte Stripe de test (non automatisable, à consigner dans la revue) : connexion avec une clé restreinte, endpoint visible dans Stripe, déconnexion puis purge, rejet d'une clé `sk_`, clé refusée = même message, publication bloquée sans compte.

## Tests summary

| Niveau | Cible | Approche |
|--------|-------|----------|
| Unitaire | `stripe-keys` | Chiffrement réel (`node:crypto`), clés de test factices |
| Unitaire | `rate-limit`, `require-prof` | Prisma mocké |
| Service | `prof-stripe-account` | Fabrique de client Stripe injectée et mockée |
| Actions | Server Actions | `redirect` qui lève une exception (comme Next.js), pas de réseau |
| Composants | Page et dialog | React Testing Library, actions mockées |
| Sécurité | Fuites | Aucune clé dans les retours, logs, erreurs, DOM |

## Hors périmètre (explicite)

- Checkout, webhook reçu, page de succès et blocage côté élève : **s20**.
- Abonnements : **s13**.
- Stockage définitif de la clé maître (KMS, gestionnaire de secrets) et procédure de rotation : à décider avec l'hébergeur ; le format versionné la rend possible.
- Déclencheur périodique de purge, journal d'audit complet, politique de rétention RGPD.
- Intention de checkout persistée et idempotence par `event.id` : à trancher dans le plan de s20.
- OAuth Connect Standard : seulement si P1 échoue ou si le risque de garder des clés de tiers est refusé.

## Definition of Done

- [ ] P1 levé (ensemble minimal de permissions établi) ou ADR de remplacement écrit ; P2, P4 et P5 confirmés
- [ ] Les 12 tâches sont terminées et cochées
- [ ] Tous les critères d'acceptation sont vérifiés
- [ ] `tsc`, lint, tests et build passent en CI
- [ ] Aucun secret dans le dépôt, les logs, les retours d'actions ni le DOM
- [ ] Vérification manuelle avec un compte Stripe de test consignée dans la revue
- [ ] Revue `docs/reviews/s19-prof-stripe-account.md` : aucun problème critique
- [ ] Déploiement conjoint avec s20 prévu
