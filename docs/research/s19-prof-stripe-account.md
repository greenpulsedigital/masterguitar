# Research — Story s19-prof-stripe-account

## Target story

**As a** prof **I want** connecter mon propre compte Stripe **so that** les paiements de mes élèves arrivent directement chez moi, sans passer par la plateforme.

### Acceptance criteria

- [ ] Le prof peut saisir sa clé API Stripe depuis `/dashboard/settings/payments` (clé restreinte recommandée, permissions minimales indiquées dans l'interface)
- [ ] La clé est validée localement puis vérifiée auprès de Stripe ; toute clé refusée produit le même message générique
- [ ] Les actions de connexion et de déconnexion vérifient le rôle `PROF` en base, sont limitées en débit et ne concernent que le compte du prof courant
- [ ] Le compte Stripe est enregistré de façon unique par prof et par mode (`test` / `live`)
- [ ] Les secrets sont chiffrés en AES-256-GCM avec IV unique, tag, données associées et version de clé
- [ ] Un endpoint webhook par prof est créé de façon idempotente, son secret est chiffré immédiatement et l’endpoint est supprimé en cas d’échec d’enregistrement
- [ ] La déconnexion désactive immédiatement les nouveaux paiements et publications, puis supprime l’endpoint côté Stripe au mieux
- [ ] Un prof sans compte Stripe `ACTIVE` ne peut pas publier un cours
- [ ] Le statut de la connexion est visible dans le dashboard

### Context from s20

s20 devra résoudre le compte uniquement depuis `course.profId`, vérifier qu’il est `ACTIVE`, créer la Checkout Session avec la clé de ce prof et vérifier les webhooks sur l’endpoint `/api/webhooks/stripe/<profId>`. Il ne doit rester aucun repli silencieux vers la clé globale actuelle. Les achats et les incidents de paiement devront aussi conserver le compte Stripe utilisé au moment du paiement.

## Current state of the code

| File / area | Role | State |
|------|------|-------|
| `src/lib/stripe.ts` | Client Stripe serveur | Singleton construit à l’import avec `STRIPE_SECRET_KEY` globale ; l’import échoue si la variable est absente ; version API fixée à `2026-07-29.dahlia`. Aucun client par prof. |
| `src/app/checkout/actions.ts` | Création de la Checkout Session | Vérifie l’authentification, le cours, le prix et les achats existants, puis appelle `stripe.checkout.sessions.create` avec la clé globale. Ne vérifie pas l’existence d’un compte Stripe du prof. |
| `src/app/checkout/[courseId]/page.tsx` | Écran avant paiement | Vérifie la session et l’achat existant, mais n’expose pas le statut Stripe du prof et ne bloque pas sur un compte `ACTIVE`. |
| `src/app/checkout/success/page.tsx` | Confirmation après Checkout | Relit la session avec le client global et valide seulement `metadata.userId`. Avec s20, il faudra retrouver le prof avant `sessions.retrieve`, valider le format de `session_id` et vérifier les métadonnées attendues. |
| `src/app/api/webhooks/stripe/route.ts` | Webhook de la plateforme | Route unique, secret `STRIPE_WEBHOOK_SECRET` global, client Stripe global. Elle gère `checkout.session.completed` et `checkout.session.async_payment_succeeded`, mais ne connaît pas de `profId`, ne limite pas explicitement la taille du corps et ne peut pas vérifier qu’un événement concerne le propriétaire du cours. |
| `prisma/schema.prisma` | Modèle de données | `User`, `Course`, `Purchase` et `PaymentIssue` existent. Il n’y a ni `ProfStripeAccount`, ni secret chiffré, ni identifiant de compte Stripe, ni snapshot du compte dans `PaymentIssue`. Le provider du dépôt est actuellement SQLite malgré le cadrage PostgreSQL. |
| `src/lib/auth.ts` | Authentification | La session JWT contient `user.id` et `user.role`. Le code actuel ne relit pas le rôle en base ; s19 doit le faire pour `connect` et `disconnect`, car le JWT ne suffit pas pour ce contrôle. |
| `src/app/(dashboard)/` | Dashboard | Il existe des écrans de dashboard et de gestion de cours, mais aucun chemin `dashboard/settings/payments` trouvé. L’interface de connexion reste à créer dans la phase Design/Execute. |
| `.env.example` | Configuration locale | Contient `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` et `STRIPE_WEBHOOK_SECRET` globaux. Aucune variable de clé de chiffrement n’est déclarée. |
| `.github/workflows/ci.yml` | CI | Injecte seulement des valeurs Stripe factices (`sk_test_ci`, `whsec_ci`) pour permettre le build. Aucun appel réseau Stripe n’est prévu ; les tests devront rester mockés. La future clé de chiffrement devra aussi être une valeur factice de CI. |
| `next.config.ts` | Configuration Next.js | Configuration par défaut ; aucun réglage spécifique au webhook ou à la limite de taille du corps. La limite devra être appliquée explicitement dans la route s20 si nécessaire. |

### What is missing for s19

- Un modèle séparé `ProfStripeAccount`, avec `profId` unique, `stripeAccountId` unique par mode, mode, statut, `encryptedSecretKey`, `keyLast4`, `webhookEndpointId`, `encryptedWebhookSecret` et dates d’audit.
- Les Server Actions de connexion et déconnexion, avec validation Zod, rôle `PROF` relu en base, limitation de débit et messages génériques.
- Un helper unique de chiffrement/déchiffrement ; aucun autre code ne doit manipuler la clé en clair.
- Une vérification Stripe de la clé saisie et une création idempotente de l’endpoint webhook.
- L’écran `/dashboard/settings/payments` et les états `non configuré`, `connecté`, `clé invalide`, `déconnexion en cours`.

## Key decision: pasted restricted key vs Stripe Connect Standard OAuth

### Comparison

| Critère | Clé API restreinte collée par le prof | Stripe Connect Standard via OAuth |
|------|------|------|
| Secret tiers en base | La plateforme reçoit et conserve un secret permettant des appels sur le compte du prof. Même chiffré, un accès à l’application en fonctionnement peut potentiellement l’utiliser. Une fuite de base seule est atténuée par le chiffrement, mais la responsabilité de custody reste chez nous. | La plateforme ne reçoit pas la clé secrète principale. Elle reçoit néanmoins des informations d’autorisation et potentiellement des tokens à protéger ; il ne faut donc pas conclure à l’absence totale de secrets. |
| Preuve de propriété / consentement | Posséder une clé prouve le contrôle de cette clé, pas la propriété légale du compte. Une clé volée peut être saisie. L’unicité de `stripeAccountId`, la validation Stripe et la limitation de débit réduisent le risque sans le supprimer. | Le prof autorise explicitement l’application depuis le flux Stripe et le compte renvoyé par Stripe est associé au consentement OAuth. C’est une preuve technique de contrôle/autorisation plus forte, mais pas à elle seule une preuve juridique de propriété. |
| Expérience du prof | Copier une clé depuis Stripe, choisir le mode, la coller puis attendre une validation. L’interface doit expliquer les permissions et le risque de ne jamais coller une clé complète si une clé restreinte suffit. | Parcours de connexion plus guidé, sans copie de secret. Il faut gérer le consentement, le retour OAuth, les erreurs, la révocation, les tokens et les comptes déjà liés. |
| Frais | Le flux direct conserve le principe de commission plateforme à 0 % ; le prof paie les frais Stripe de son propre compte. Aucun chiffre de frais supplémentaire n’est introduit ici. | L’ADR 004 mentionne une surcharge Connect, mais ce point tarifaire n’est pas vérifiable hors réseau et ne doit pas être utilisé comme fait actuel. **À VÉRIFIER** dans la tarification Stripe applicable au compte et au montage retenu. |
| Responsabilité opérationnelle | Nous devons protéger les clés, empêcher les logs de secrets, gérer la rotation, les endpoints webhook et les erreurs d’accès. Stripe traite directement le paiement sur le compte du prof ; la plateforme ne doit pas présenter cela comme une migration de fonds. | Stripe prend en charge davantage de l’onboarding Connect, mais le montage entraîne des responsabilités supplémentaires d’intégration et éventuellement de conformité. La répartition exacte des responsabilités dépend du type de compte et du contrat Connect. **À VÉRIFIER** dans la documentation Stripe et avec un avis juridique si le produit sort du MVP. |
| Effort | Modèle local, mais effort de sécurité élevé : chiffrement, versionnage, validation, endpoint par prof, rotation et procédures de récupération. | Effort initial et dépendance Stripe plus élevés : OAuth, états d’autorisation, tokens, révocation, onboarding et adaptation des appels API. |
| Compatibilité avec l’ADR 004 | Directement compatible : un compte Stripe par prof, sans Connect, la plateforme n’encaisse pas. | Incompatible avec la décision « pas de Stripe Connect » tant qu’un nouvel ADR ne l’a pas remplacée. |
| Effet sur s20 | `getStripeForProf(profId)` déchiffre la clé du prof ; le checkout et le webhook utilisent le compte résolu depuis le cours. | s20 doit résoudre l’autorisation OAuth et le compte Connect au lieu de déchiffrer une clé API ; les appels Stripe et les webhooks doivent suivre le modèle Connect choisi. |

### Recommendation

Recommandation pour le MVP : conserver la clé API restreinte collée, conformément à l’ADR 004 et au périmètre actuel de s19, mais ne valider le plan que si les contrôles suivants passent :

1. Une vraie clé restreinte de test confirme les opérations nécessaires pour lire le compte, créer/lire/supprimer un endpoint webhook et créer/lire une Checkout Session.
2. La clé est chiffrée immédiatement avec `AES-256-GCM`, la clé maître reste hors base et hors Git, et aucun secret ne passe dans les logs, props, cookies, URL ou résultats de Server Action.
3. Le flux refuse les clés de test en production et les clés live dans les environnements qui ne sont pas explicitement prévus pour elles.
4. La suppression/recréation d’un endpoint et la récupération après perte du secret de signature sont documentées.

Si une clé restreinte ne permet pas l’une des opérations webhook nécessaires, ou si le risque de custody est refusé après revue sécurité, il faut arrêter avant le plan, écrire un ADR qui supersède l’ADR 004 et basculer vers Connect Standard OAuth. Il ne faut pas contourner la restriction avec une clé secrète globale.

## Minimal restricted-key permissions

Le mapping fonctionnel minimal est certain au niveau des opérations utilisées par le produit :

| Besoin du produit | Opération nécessaire | Permission conceptuelle minimale | Certitude |
|------|------|------|------|
| Créer une Checkout Session | `checkout.sessions.create` | Écriture sur Checkout Sessions | L’appel SDK utilisé est identifié ; le libellé exact de la permission dans le Dashboard Stripe est **À VÉRIFIER**. |
| Lire une Checkout Session | `checkout.sessions.retrieve` | Lecture sur Checkout Sessions | L’appel SDK est identifié ; le libellé exact et la disponibilité avec une clé restreinte sont **À VÉRIFIER**. |
| Créer un endpoint webhook | `webhookEndpoints.create` | Écriture sur Webhook Endpoints | L’intention est claire ; la permission exacte, la compatibilité avec une clé restreinte et les champs autorisés sont **À VÉRIFIER** avec une clé de test. |
| Lire un endpoint webhook | `webhookEndpoints.retrieve` ou équivalent de lecture | Lecture sur Webhook Endpoints | L’opération cible est claire ; le nom de permission exact et la nécessité de lire une liste plutôt qu’un endpoint sont **À VÉRIFIER**. |
| Supprimer un endpoint webhook | `webhookEndpoints.del` ou équivalent de suppression | Écriture/suppression sur Webhook Endpoints | Le besoin de suppression est imposé par la déconnexion ; le nom de permission et la possibilité de suppression avec la même clé sont **À VÉRIFIER**. |
| Lire le compte Stripe | opération de lecture de l’objet Account | Lecture sur Account | Le compte doit être identifié et son mode vérifié ; le nom exact de l’appel, le champ de mode fiable et la permission Dashboard sont **À VÉRIFIER**. |

À ne pas accorder par défaut : remboursements, transferts, paiements directs, clients, produits, prix, abonnements ou balance si aucune étape de s19/s20 ne les utilise. Les abonnements relèvent de s13 et devront faire l’objet d’une vérification séparée avant d’élargir les permissions.

### Verification procedure before the plan

Avec une clé restreinte de test dédiée et sans la committer : créer une Checkout Session de test, la relire, lire le compte, créer un endpoint webhook de test, relire son identifiant, le supprimer, puis vérifier les refus obtenus après retrait de chaque permission. Conserver les noms exacts des permissions et les résultats dans le plan ou un ADR ; ne pas les déduire d’un exemple de code.

Le script `scripts/check-stripe-restricted-key.sh` exécute ces appels avec une clé `rk_test_...` (il refuse les clés live et les clés secrètes complètes, masque les clés dans sa sortie et supprime l'endpoint de test). Usage : `read -rs STRIPE_RK; export STRIPE_RK; bash scripts/check-stripe-restricted-key.sh`. Pour trouver l'ensemble minimal, retirer les permissions une par une de la clé et relancer.

**À VÉRIFIER :** confirmer aussi si le secret de signature est renvoyé une seule fois par la création de l’endpoint. Le code doit le chiffrer immédiatement et considérer toute réponse ultérieure sans secret comme une erreur de provisioning, sans journaliser la réponse sensible.

## Local development

Le webhook Stripe ne peut pas appeler directement `localhost`. Deux modes sont nécessaires :

1. **Stripe CLI avec forwarding local.** Utiliser Stripe CLI pour transférer les événements de test vers la route locale, en incluant le `profId` attendu par s20. Le secret produit par Stripe CLI est le secret de signature du forwarding CLI ; il ne faut pas le confondre avec le secret d’un endpoint créé dans le compte Stripe du prof. La commande exacte et le comportement par version de Stripe CLI sont **À VÉRIFIER** dans la documentation/installation locale.
2. **Tunnel public.** Exposer temporairement l’application locale avec un tunnel HTTPS, renseigner l’URL publique de développement, puis laisser s19 créer l’endpoint test sur le compte du prof. Le tunnel, son expiration et la rotation des URLs doivent être considérés comme des éléments de développement, jamais comme une URL de production.

Prévoir un mode opératoire de **saisie manuelle du secret de webhook en local** : capturer le secret une seule fois lors de la création ou du forwarding, l’injecter dans la base locale via la même fonction de chiffrement que l’application, puis ne conserver en clair que la valeur éphémère nécessaire à l’opération. Ne jamais le mettre dans Git, une URL, un log ou une fixture partagée. Si le secret est perdu, supprimer puis recréer l’endpoint de test au lieu de désactiver la vérification de signature.

La CI doit continuer à mocker Stripe. Elle n’a pas besoin de créer de vrais endpoints et ne doit recevoir ni clé Stripe réelle ni secret de webhook réel.

## Test keys in production

Décision proposée : les clés de test sont acceptées uniquement en développement/test ; une clé de test doit être refusée en production avant stockage et avant création d’endpoint. En développement, stocker le mode `test` explicitement et n’autoriser que des cours/événements de test.

Le préfixe de clé peut servir à un contrôle local précoce, mais il ne doit pas être la seule preuve du mode. Le signal Stripe fiable à utiliser pour confirmer le mode du compte, ainsi que le champ exact à lire, sont **À VÉRIFIER** avec une clé de test puis une clé live contrôlée. Quel que soit le résultat, le message utilisateur reste générique et les détails restent dans une journalisation opérationnelle sans secret.

## Encryption-key storage and rotation

Le contrat de s19 est un chiffrement applicatif AES-256-GCM via `node:crypto` : format versionné de type `v1:iv:tag:ciphertext`, IV aléatoire de 12 octets par chiffrement, et données associées canoniques `profId|mode|usage|version`. Le ciphertext et les métadonnées peuvent être en base ; la clé maître ne le doit pas.

| Option | Adaptation à un hébergeur encore inconnu | Recommandation |
|------|------|------|
| Secret d’environnement fourni par l’hébergeur | Portable et suffisant pour le MVP si le secret est provisionné hors Git, hors base, hors `NEXT_PUBLIC_*` et exclu des sauvegardes applicatives. | Choix MVP : `STRIPE_KEYS_ENCRYPTION_KEY`, 32 octets, avec procédure de provisionnement et de récupération documentée. |
| Secret manager managé par l’hébergeur | Meilleure gestion d’accès et d’audit, mais API et IAM dépendants du fournisseur. | Adopter dès qu’un hébergeur est choisi ; garder une interface indépendante du fournisseur. |
| KMS avec envelope encryption | Réduit l’exposition de la clé maître et facilite les rotations, au prix d’une dépendance réseau/IAM et d’une conception plus complexe. | Option cible si les exigences de disponibilité, audit ou équipe le justifient ; pas nécessaire pour décider s19. |

La rotation doit avoir deux notions séparées : une clé **courante** pour les nouveaux chiffrements et des clés **anciennes** conservées temporairement pour les lectures. Le préfixe de version dans le ciphertext indique quelle clé tenter. Le déchiffrement doit échouer fermé si la version, le tag ou les données associées ne correspondent pas ; aucun repli vers une autre version ne doit être silencieux.

Stratégie recommandée : ajouter une nouvelle version, déployer la lecture des anciennes et l’écriture de la nouvelle, ré-chiffrer progressivement les secrets actifs, vérifier qu’aucune ancienne version n’est encore utilisée, puis retirer l’ancienne clé selon la politique de rétention. La perte de la seule clé active rend les secrets irrécupérables ; la procédure d’exploitation doit donc traiter les clés de chiffrement comme des secrets critiques, avec sauvegarde sécurisée séparée de la base.

## Migration from the current global key and existing purchases

Le code actuel ne permet pas une migration transparente des objets Stripe : il n’y a pas de `profId` ou de `stripeAccountId` dans `Purchase`, et les paiements existants ont été créés sur le compte Stripe global de la plateforme. Connecter un prof ne déplace ni les paiements, ni les clients, ni les remboursements historiques vers son compte.

Avant toute bascule :

- inventorier les `Purchase`, `PaymentIssue`, sessions en attente et événements webhook en vol ;
- vérifier dans le Dashboard Stripe si le compte global contient uniquement des achats de test ou de vraies ventes ;
- identifier les duplications éventuelles avant migration des contraintes et déterminer si les migrations s07 sont réellement appliquées ;
- conserver un accès contrôlé à la clé globale jusqu’à la fin de la fenêtre de drainage, sans l’utiliser pour de nouvelles sessions.

Si seuls des achats de test existent, conserver les lignes en base pour les tests/audit, les traiter comme historique de test et supprimer l’ancien endpoint après vérification qu’aucun événement utile n’est en vol. Si de vraies ventes existent, ne pas les déplacer ni les réattribuer artificiellement : elles restent rattachées au compte plateforme d’origine et les remboursements restent à faire sur ce compte. Garder temporairement l’ancien webhook en mode drainage, sans nouvelles sessions, jusqu’à la fin d’une fenêtre documentée.

Les achats existants doivent continuer à donner l’accès déjà accordé. Pour les incidents historiques, le `profId` et le compte Stripe réellement utilisés ne peuvent pas toujours être reconstruits depuis le schéma actuel ; un audit manuel ou une migration explicite est nécessaire avant d’ajouter les snapshots exigés par s20. Les nouveaux paiements doivent, eux, enregistrer le `profId`, le `stripeAccountId` et le mode au moment du paiement.

À la déconnexion, les cours déjà publiés restent visibles mais ne sont plus achetables : s20 doit revalider l’état `ACTIVE` juste avant la création de session. Ne pas repasser automatiquement les cours en brouillon ; cela détruirait une intention éditoriale et ne résout pas l’accès des acheteurs existants.

## Réponses proposées aux 6 questions de s19

1. **Clé collée ou OAuth Connect Standard ?** — Choisir la clé restreinte collée pour le MVP afin de respecter l’ADR 004, sous réserve de la validation réelle des permissions et des contrôles de chiffrement ; sinon réviser l’ADR et passer à OAuth Connect Standard.
2. **Clés de test en production ?** — Refuser les clés de test en production ; les accepter uniquement dans les environnements de développement/test avec un mode explicitement enregistré.
3. **Développement local ?** — Documenter Stripe CLI pour le forwarding local, un tunnel public pour tester la création réelle d’un endpoint et une saisie manuelle chiffrée du secret de webhook en local.
4. **Rotation de la clé de chiffrement ?** — Hors migration fonctionnelle de s19, mais imposer dès maintenant un format versionné, la lecture des anciennes versions et une procédure de ré-chiffrement progressif.
5. **Cours déjà publiés à la déconnexion ?** — Les laisser visibles mais non achetables ; désactiver immédiatement les publications et les nouveaux checkouts, sans retirer l’accès aux achats existants.
6. **Ventes déjà faites sur le compte plateforme ?** — Les conserver comme historique et les drainer sur le compte d’origine ; confirmer avant le plan s’il existe de vraies ventes. Ne pas prétendre les transférer au compte du prof.

## Points à vérifier avant le plan

- [ ] Tester avec une vraie clé restreinte de test la création, lecture et suppression d’un endpoint webhook.
- [ ] Confirmer les libellés exacts des permissions Stripe pour Checkout Sessions, Webhook Endpoints et Account.
- [ ] Confirmer que la même clé restreinte peut effectuer toutes les opérations nécessaires, y compris la suppression d’un endpoint.
- [ ] Confirmer la réponse exacte de la lecture du compte et le signal fiable `test` / `live`.
- [ ] Confirmer si le secret de signature est renvoyé une seule fois lors de la création de l’endpoint et comment récupérer une valeur perdue.
- [ ] Confirmer la gestion Stripe CLI du secret de forwarding et la compatibilité avec la route `/api/webhooks/stripe/<profId>`.
- [ ] Vérifier le fonctionnement d’un tunnel HTTPS local et la politique de durée de vie de son URL.
- [ ] Définir le stockage de `STRIPE_KEYS_ENCRYPTION_KEY` pour l’hébergeur retenu, ou documenter le secret d’environnement portable pour le MVP.
- [ ] Définir la procédure de rotation, de sauvegarde sécurisée et de révocation des versions anciennes de la clé de chiffrement.
- [ ] Inventorier les achats, incidents et événements en vol du compte Stripe global ; confirmer s’il n’existe que des achats de test.
- [ ] Décider la fenêtre de drainage de l’ancien webhook et le critère de suppression des variables Stripe globales.
- [ ] Définir le rate limiting persistant par utilisateur et adresse IP, compatible avec plusieurs instances.
- [ ] Confirmer le modèle de données et la migration `ProfStripeAccount`, notamment les contraintes d’unicité par prof, compte et mode.
- [ ] Faire relire le parcours clé collée par la sécurité et, si nécessaire, faire trancher le choix OAuth par un nouvel ADR avant `/ks-plan`.

## Summary

Le code actuel repose entièrement sur une clé et un webhook Stripe globaux ; s19 doit introduire un compte et un secret par prof avant que s20 puisse créer des paiements au bon endroit. La recommandation est de garder la clé restreinte collée pour le MVP, avec chiffrement AES-256-GCM, clé maître hors base, refus des clés de test en production et validation réelle des permissions Stripe. OAuth Connect Standard est le plan de repli si ces permissions ou le risque de custody ne sont pas acceptables.

Les points marqués **À VÉRIFIER** concernent les libellés et capacités exacts des permissions de clés restreintes, la lecture du mode du compte, la restitution unique du secret webhook et les détails Stripe CLI/tunnel. Les achats existants doivent rester attachés au compte plateforme d’origine ; ils ne sont pas transférés par la connexion d’un prof.
