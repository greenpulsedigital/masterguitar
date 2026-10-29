# User Stories — MasterGuitar

> One story = one shippable slice, written to be executed by an agent.
> Id format: `s<number>-<short-slug>` — reused in every pipeline file and in the branch name.

## Recadrage v2 (2026-10-29)

Le PRD v2 (`docs/prd.md`, ADR 009 à 013) remplace la vente de cours aux élèves par des espaces de cours privés et un abonnement du professeur. Les stories s01 à s20 restent ci-dessous pour l'historique ; leur statut v2 :

| Story | État au 2026-10-29 | Statut v2 |
|---|---|---|
| s01-project-foundation | livrée | Réutilisée (bascule PostgreSQL dans s21, thème dans le design system v2) |
| s02-prof-auth | livrée | Réutilisée (connexion, inscription, sessions) ; rôle global remplacé par ADR 011 |
| s03-course-crud, s04-course-structure, s05-video-lessons | livrées | Gelées ; réservoir de patterns pour s27 (ordre, formulaires, actions) |
| s06-sales-page | livrée | Gelée (vente élève hors MVP) |
| s07-stripe-checkout | fusionnée, `Ship allowed: no` | Gelée (ADR 009) |
| s08 à s18 | non commencées | Abandonnées ou reportées après MVP (s11/s14 outils guitare et tablature → P1 ; s15 forum → remplacé par s30/s31) |
| s19-prof-stripe-account | fusionnée, revue en cours | Gelée (ADR 009) ; chiffrement et limitation de débit réutilisables |
| s20-checkout-per-prof | planifiée, non commencée | Abandonnée (ADR 009) |

Les nouvelles stories s21 à s45 suivent les lots du dossier v2 (M1 à M6). M0 n'est pas une story : c'est l'audit et les preuves terrain décrits dans `docs/m0-audit.md`.

---

## Story s01-project-foundation — Setup technique

**As a** développeur **I want** un projet Next.js configuré avec la stack complète **so that** je peux commencer à développer les features.

### Complexity
2

### Acceptance criteria
- [ ] Next.js 14 App Router initialisé
- [ ] Tailwind CSS configuré avec design tokens "studio" (couleurs sombres, accents)
- [ ] Prisma + PostgreSQL configurés
- [ ] Layout de base (header, footer, conteneur)
- [ ] Le projet build sans erreur
- [ ] Les tests unitaires passent (setup Jest/Vitest)

### Dependencies
Aucune

### Agentic notes
- Stack: Next.js 14 App Router, Tailwind, Prisma, PostgreSQL
- Design: palette sombre "studio" — noir, gris anthracite, accent doré ou cuivre
- Mobile-first: breakpoints Tailwind par défaut
- Référence Podia: observer le layout général, mais viser plus premium/sombre

---

## Story s02-prof-auth — Authentification prof

**As a** prof de guitare **I want** créer un compte et me connecter **so that** je peux accéder à mon espace de création de cours.

### Complexity
2

### Acceptance criteria
- [ ] Un prof peut s'inscrire avec email + mot de passe
- [ ] Un prof peut se connecter
- [ ] Un prof peut se déconnecter
- [ ] Les routes `/dashboard/*` sont protégées (redirect si non connecté)
- [ ] Le prof voit son email dans le header une fois connecté

### Dependencies
s01-project-foundation

### Agentic notes
- Utiliser NextAuth.js avec Credentials provider (email/password)
- Table `User` dans Prisma avec rôle `PROF`
- Pages: `/login`, `/signup`, `/dashboard`
- Référence Podia: flow de signup simple, pas de friction

---

## Story s03-course-crud — Création de cours

**As a** prof **I want** créer, modifier et supprimer mes cours **so that** je peux organiser mon catalogue.

### Complexity
2

### Acceptance criteria
- [ ] Le prof peut créer un cours (titre, description, prix, thumbnail)
- [ ] Le prof peut voir la liste de ses cours
- [ ] Le prof peut modifier un cours existant
- [ ] Le prof peut supprimer un cours (soft delete ou confirmation)
- [ ] Le cours a un slug unique pour l'URL publique

### Dependencies
s02-prof-auth

### Agentic notes
- Table `Course` liée à `User` (prof)
- Champs: title, slug, description, price, thumbnailUrl, status (draft/published)
- UI: formulaire simple, upload thumbnail via URL externe pour MVP
- Référence Podia: `/products` dans le dashboard

---

## Story s04-course-structure — Modules et structure

**As a** prof **I want** organiser mon cours en modules **so that** les élèves ont une progression claire.

### Complexity
2

### Acceptance criteria
- [ ] Le prof peut ajouter des modules à un cours
- [ ] Le prof peut renommer un module
- [ ] Le prof peut réordonner les modules (drag-drop ou boutons up/down)
- [ ] Le prof peut supprimer un module
- [ ] Les modules apparaissent dans l'ordre défini

### Dependencies
s03-course-crud

### Agentic notes
- Table `Module` avec `courseId`, `title`, `order`
- UI: liste verticale avec contrôles de réordonnancement
- Pas de lessons ici — juste la structure de modules
- Référence Podia: éditeur de curriculum

---

## Story s05-video-lessons — Ajout de leçons vidéo

**As a** prof **I want** ajouter des leçons vidéo à mes modules **so that** les élèves peuvent apprendre.

### Complexity
2

### Acceptance criteria
- [ ] Le prof peut ajouter une leçon à un module
- [ ] La leçon a un titre, une description, une URL vidéo externe
- [ ] Le prof peut réordonner les leçons dans un module
- [ ] Le prof peut modifier ou supprimer une leçon
- [ ] La vidéo s'affiche en preview dans l'éditeur

### Dependencies
s04-course-structure

### Agentic notes
- Table `Lesson` avec `moduleId`, `title`, `description`, `videoUrl`, `order`
- Vidéo: embed externe (YouTube, Vimeo, Bunny, Mux) — juste une URL
- Pas de player avancé ici, juste l'embed basique
- Référence Podia: ajout de "content" dans un produit

---

## Story s06-sales-page — Page de vente publique

**As a** prof **I want** une page de vente publique pour mon cours **so that** les élèves potentiels peuvent découvrir et acheter.

### Complexity
2

### Acceptance criteria
- [ ] Chaque cours publié a une URL publique `/cours/[slug]`
- [ ] La page affiche: titre, description, thumbnail, prix, curriculum (modules)
- [ ] Un bouton "Acheter" est visible
- [ ] La page est mobile-first et design "studio"
- [ ] Un cours en draft n'est pas accessible publiquement

### Dependencies
s03-course-crud

### Agentic notes
- Route publique: `/cours/[slug]`
- Pas de paiement ici — juste la page, le bouton mène à checkout (s07)
- Design premium: typographie soignée, espaces, ambiance sombre
- Référence Podia: page de vente d'un produit

---

## Story s07-stripe-checkout — Paiement one-shot

**As a** élève **I want** acheter un cours par carte bancaire **so that** je peux accéder au contenu.

### Complexity
3

### Acceptance criteria
- [ ] Le bouton "Acheter" redirige vers Stripe Checkout
- [ ] Le paiement réussi crée un accès pour l'élève
- [ ] Le paiement réussi redirige vers une page de confirmation
- [ ] Le webhook Stripe est géré (payment_intent.succeeded)
- [ ] Le prof reçoit 100% du montant (moins frais Stripe)

### Dependencies
s06-sales-page

### Agentic notes
- Stripe Checkout (hosted) pour MVP — pas d'Elements custom
- Table `Purchase` avec `userId`, `courseId`, `stripePaymentId`, `amount`
- Webhook: `/api/webhooks/stripe`
- L'élève doit avoir un compte (créé au checkout ou pré-existant)
- Référence Podia: flow d'achat
- **Livraison conditionnée à s20-checkout-per-prof** : le critère « le prof reçoit 100% » n'est atteint que lorsque les paiements passent par le compte Stripe du prof (ADR 004, décision du 2026-10-04). Avec la clé globale actuelle, l'argent arrive sur le compte de la plateforme.

---

## Story s08-student-access — Accès élève

**As a** élève **I want** me connecter et voir mes cours achetés **so that** je peux apprendre.

### Complexity
2

### Acceptance criteria
- [ ] Un élève peut s'inscrire / se connecter
- [ ] L'élève voit la liste de ses cours achetés sur `/mes-cours`
- [ ] L'élève ne peut pas accéder à un cours non acheté
- [ ] L'accès est vérifié côté serveur (pas juste UI)

### Dependencies
s07-stripe-checkout

### Agentic notes
- Réutiliser NextAuth, ajouter rôle `STUDENT` ou flag
- Un user peut être prof ET élève (acheter les cours d'autres profs)
- Gate l'accès via `Purchase` — pas d'accès = redirect
- Référence Podia: espace membre

---

## Story s09-course-player — Lecteur de cours

**As a** élève **I want** regarder les vidéos d'un cours acheté **so that** je peux apprendre la guitare.

### Complexity
2

### Acceptance criteria
- [ ] L'élève accède au player via `/apprendre/[courseSlug]`
- [ ] Le player affiche le curriculum (modules + leçons) en sidebar
- [ ] Cliquer sur une leçon charge la vidéo
- [ ] La vidéo se lit correctement (embed externe)
- [ ] L'UI est mobile-first (sidebar collapse sur mobile)

### Dependencies
s05-video-lessons, s08-student-access

### Agentic notes
- Layout: sidebar gauche (curriculum) + zone vidéo principale
- Mobile: sidebar en drawer ou accordéon
- Pas de progress tracking ici — juste le player
- Référence Podia: interface de cours côté élève

---

## Story s10-progress-tracking — Suivi de progression

**As a** élève **I want** voir ma progression dans un cours **so that** je sais où j'en suis.

### Complexity
2

### Acceptance criteria
- [ ] L'élève peut marquer une leçon comme "terminée"
- [ ] La progression par module est affichée (X/Y leçons)
- [ ] La progression globale du cours est affichée
- [ ] L'élève reprend là où il s'est arrêté (dernière leçon vue)

### Dependencies
s09-course-player

### Agentic notes
- Table `Progress` avec `userId`, `lessonId`, `completedAt`
- Calcul de progression: count completed / total lessons
- UI: checkmarks sur les leçons, barre de progression
- Référence Podia: indicateurs de completion

---

## Story s11-guitar-tools — Outils guitare (ralenti, boucle)

**As a** élève guitariste **I want** ralentir la vidéo et boucler des sections **so that** je peux travailler les passages difficiles.

### Complexity
3

### Acceptance criteria
- [ ] Un slider permet de régler la vitesse (0.25x à 1x)
- [ ] Le player conserve le pitch audio en ralenti (si possible)
- [ ] L'élève peut définir un point A et B pour boucler
- [ ] La boucle se répète automatiquement jusqu'à désactivation
- [ ] Les contrôles sont accessibles sur mobile

### Dependencies
s09-course-player

### Agentic notes
- HTML5 video `playbackRate` pour la vitesse
- Boucle A-B: stocker timestamps, `timeupdate` event pour revenir à A
- UI: boutons A/B, affichage des timestamps sélectionnés
- Pitch preservation: dépend du navigateur, documenter les limites
- Différenciateur clé vs Podia — soigner l'UX

---

## Story s12-prof-dashboard — Tableau de bord prof

**As a** prof **I want** voir mes ventes et revenus **so that** je sais comment mon business performe.

### Complexity
2

### Acceptance criteria
- [ ] Le dashboard affiche le nombre total de ventes
- [ ] Le dashboard affiche le revenu total (et par cours)
- [ ] Le dashboard liste les dernières ventes (date, cours, montant)
- [ ] Le dashboard affiche le nombre d'élèves inscrits

### Dependencies
s03-course-crud, s07-stripe-checkout

### Agentic notes
- Agrégations depuis `Purchase`
- UI: cards avec chiffres clés + table des ventes récentes
- Pas de graphiques complexes pour le MVP
- Référence Podia: dashboard principal

---

## Story s13-subscriptions — Abonnements récurrents

**As a** prof **I want** proposer un abonnement mensuel **so that** j'ai des revenus récurrents.

### Complexity
3

### Acceptance criteria
- [ ] Le prof peut configurer un cours en mode "abonnement" (prix mensuel)
- [ ] L'élève peut souscrire via Stripe
- [ ] L'accès est révoqué si l'abonnement est annulé
- [ ] Le prof voit les abonnements actifs dans son dashboard

### Dependencies
s07-stripe-checkout, s20-checkout-per-prof

### Agentic notes
- Stripe Subscriptions API
- Table `Subscription` avec status (active, canceled, past_due)
- Webhooks: `customer.subscription.created`, `customer.subscription.deleted`
- Gate l'accès: vérifier subscription active, pas juste purchase
- Référence Podia: membership products

---

## Story s14-tablature — Affichage tablatures

**As a** élève **I want** voir les tablatures associées à une leçon **so that** je peux lire les notes en même temps que la vidéo.

### Complexity
3

### Acceptance criteria
- [ ] Le prof peut uploader/associer un fichier tab à une leçon (PDF ou image)
- [ ] L'élève voit la tablature à côté ou sous la vidéo
- [ ] La tablature est zoomable/scrollable
- [ ] L'affichage fonctionne sur mobile

### Dependencies
s05-video-lessons

### Agentic notes
- MVP: PDF viewer ou image simple (pas de rendu interactif de tab)
- Champ `tabUrl` sur `Lesson`
- Layout: split view sur desktop, stacked sur mobile
- Future: parser Guitar Pro / ASCII tabs — hors scope MVP
- Différenciateur clé vs Podia

---

## Story s15-community — Forum de cours

**As a** élève **I want** poser des questions sur un cours **so that** je peux interagir avec le prof et les autres élèves.

### Complexity
3

### Acceptance criteria
- [ ] Chaque cours a un espace de discussion
- [ ] Un élève (inscrit au cours) peut poster un message
- [ ] Les messages affichent auteur et date
- [ ] Le prof peut répondre et supprimer des messages
- [ ] Notifications basiques (email ou in-app) pour le prof

### Dependencies
s08-student-access

### Agentic notes
- Table `Post` avec `courseId`, `userId`, `content`, `parentId` (pour replies)
- UI: liste de threads, formulaire de réponse
- Modération: soft delete, flag spam (basique)
- Référence Podia: community feature

---

## Story s16-affiliation — Système d'affiliation

**As a** prof **I want** créer des liens d'affiliation **so that** d'autres personnes promeuvent mes cours contre commission.

### Complexity
3

### Acceptance criteria
- [ ] Le prof peut activer l'affiliation sur un cours
- [ ] Le prof définit un % de commission
- [ ] Un affilié génère un lien unique
- [ ] Les ventes via ce lien sont trackées
- [ ] L'affilié voit ses conversions et gains

### Dependencies
s07-stripe-checkout

### Agentic notes
- Table `Affiliate` et `AffiliateConversion`
- Lien: `?ref=AFFILIATE_CODE` sur la sales page
- Cookie de tracking (30 jours classique)
- Payout hors scope MVP — juste le tracking et dashboard affilié
- Référence Podia: affiliate feature

---

## Story s17-bundles — Packs de cours

**As a** prof **I want** vendre plusieurs cours ensemble à prix réduit **so that** j'augmente le panier moyen.

### Complexity
3

### Acceptance criteria
- [ ] Le prof peut créer un bundle (sélectionner plusieurs cours)
- [ ] Le bundle a son propre prix (inférieur à la somme)
- [ ] Le bundle a sa propre page de vente
- [ ] L'achat du bundle donne accès à tous les cours inclus

### Dependencies
s03-course-crud, s07-stripe-checkout

### Agentic notes
- Table `Bundle` avec relation many-to-many vers `Course`
- Réutiliser le flow de checkout
- Créer plusieurs `Purchase` à l'achat (un par cours)
- Référence Podia: bundles

---

## Story s18-upsells — Upsells post-achat

**As a** prof **I want** proposer un produit complémentaire après un achat **so that** j'augmente mes revenus.

### Complexity
2

### Acceptance criteria
- [ ] Le prof peut configurer un upsell sur un cours (quel produit proposer)
- [ ] Après un achat réussi, l'upsell est affiché
- [ ] L'élève peut accepter ou refuser en un clic
- [ ] L'acceptation déclenche un paiement supplémentaire

### Dependencies
s07-stripe-checkout

### Agentic notes
- Champ `upsellCourseId` sur `Course`
- Page post-checkout avec offre "one-click"
- Stripe: réutiliser le PaymentMethod du client pour charge rapide
- Référence Podia: upsell flows

---

## Story s19-prof-stripe-account — Connexion du compte Stripe du prof

**As a** prof **I want** connecter mon propre compte Stripe **so that** les paiements de mes élèves arrivent directement chez moi, sans passer par la plateforme.

### Complexity
4

### Acceptance criteria
- [ ] Le prof peut saisir sa clé API Stripe depuis `/dashboard/settings/payments` (clé restreinte recommandée, permissions minimales indiquées dans l'interface)
- [ ] La saisie est contrôlée localement (format, longueur maximale) puis vérifiée auprès de Stripe ; toute clé refusée (invalide, expirée, sans permission, limitée) donne le même message générique, sans détail Stripe ni identifiant de compte
- [ ] Les actions de connexion et de déconnexion exigent le rôle `PROF` vérifié en base (pas seulement dans le JWT), sont limitées en débit par utilisateur et par adresse IP, et ne permettent à un prof de gérer que son propre compte
- [ ] L'identifiant du compte Stripe (`stripeAccountId`) est enregistré et unique par mode : un même compte Stripe ne peut pas être lié à deux profs
- [ ] Chaque secret est chiffré en AES-256-GCM avec un IV unique, un tag d'authentification et des données associées liant `profId`, mode, usage et version de clé ; toute incohérence (tag, données associées, version) fait échouer le déchiffrement, sans repli
- [ ] Aucun secret en clair n'apparaît dans les logs, erreurs, props, cookies, URL ou résultats de Server Actions ; seuls les 4 derniers caractères et le mode (test / live) sont affichés
- [ ] À la connexion, un endpoint webhook est créé sur le compte du prof (événements `checkout.session.completed` et `checkout.session.async_payment_succeeded`) de façon idempotente (clé d'idempotence, réutilisation d'un endpoint identique déjà présent) ; son secret de signature est chiffré immédiatement ; si l'enregistrement échoue, l'endpoint créé est supprimé
- [ ] La déconnexion passe par un état intermédiaire : nouveaux checkouts et publications désactivés immédiatement, endpoint, clé et secret conservés chiffrés pendant une fenêtre de réconciliation documentée (pour laisser aboutir les paiements en cours), puis endpoint supprimé côté Stripe (au mieux) et secrets effacés
- [ ] Un prof sans compte `ACTIVE` ne peut pas publier un cours (vérification atomique dans `toggleCourseStatus`) et voit pourquoi (lien vers la page de paiement)
- [ ] Le statut du compte (non configuré / connecté / clé invalide / déconnexion en cours) est visible dans le dashboard

### Dependencies
s02-prof-auth, s03-course-crud

### Agentic notes
- Décision de référence : ADR 004 (2026-10-04) — un compte Stripe par prof, sans Stripe Connect. La plateforme n'encaisse pas l'argent.
- **Story avec interface** : passer par `/ks-design` (page `/dashboard/settings/payments`, composants du design system uniquement).
- Modèle `ProfStripeAccount` séparé de `User` : `profId` unique, `encryptedSecretKey`, `keyLast4`, `mode` (test / live), `status`, `webhookEndpointId`, `encryptedWebhookSecret`, dates.
- Chiffrement : AES-256-GCM via `node:crypto`. Format versionné du type `v1:iv:tag:ciphertext` (base64), IV aléatoire de 12 octets **par chiffrement**, données associées canoniques `profId|mode|usage|version`. Clé maître de 32 octets dans une variable d'environnement dédiée (`STRIPE_KEYS_ENCRYPTION_KEY`, documentée dans `.env.example`), jamais en base, dans Git, dans une sauvegarde, ni dans une variable `NEXT_PUBLIC_*` ; le format permet la rotation (lecture des anciennes versions, ré-chiffrement progressif). Helper unique `src/lib/stripe-keys.ts` ; aucun autre code ne manipule la clé en clair.
- Limitation de débit : aucune dépendance existante ; un compteur simple en base (par `userId` et adresse IP, fenêtre glissante) évite de dépendre de la mémoire d'une instance. Choix à fixer dans le plan.
- Vérification de la clé : un appel de lecture à Stripe avec la clé saisie (à choisir dans la doc, compatible avec une clé restreinte) ; enregistrer le `stripeAccountId` renvoyé. **Avant le plan**, vérifier avec une vraie clé restreinte de test les permissions minimales pour la lecture du compte et pour `webhookEndpoints` (création, lecture, suppression) ; si elles sont incompatibles avec le modèle « clé restreinte », bloquer la connexion automatique du webhook et réviser l'ADR. `webhookEndpoints.create` renvoie le secret de signature **une seule fois** (à confirmer dans la doc Stripe) — le chiffrer et le stocker immédiatement, ne jamais le journaliser. URL de l'endpoint : `<URL publique>/api/webhooks/stripe/<profId>` (réalisé dans s20).
- Server Actions `connectStripeAccount` / `disconnectStripeAccount` : rôle `PROF` relu en base, validation Zod, `redirect()` hors des `try/catch` (leçon du dépôt), erreurs Stripe traduites en messages sans fuite de la clé.
- `toggleCourseStatus` : refuser le passage en `PUBLISHED` si le prof n'a pas de compte `ACTIVE` (le checkout revalide aussi, en défense en profondeur).
- Le dépôt est public et la CI n'utilise que de fausses valeurs : aucun test ne doit appeler Stripe ; mocker le client.
- **À trancher avant le plan** :
  1. *Clé collée ou OAuth Connect Standard ?* L'ADR retient les clés collées, mais stocker des clés secrètes de tiers est un risque (fuite de la base = accès aux comptes). Atténuations : clés restreintes, chiffrement, clé de chiffrement hors base. Limite des clés collées : coller une clé prouve qu'on la possède, pas qu'on est propriétaire du compte (une clé volée peut être branchée) ; l'unicité du `stripeAccountId` et la limitation de débit réduisent le risque sans l'éliminer. Un OAuth Connect Standard éviterait de stocker des clés mais change l'ADR. À reconfirmer avant le plan.
  2. *Clés de test en production* : proposition — refusées en production, acceptées en développement.
  3. *Développement local* : Stripe n'atteint pas `localhost` ; prévoir Stripe CLI / tunnel, ou une saisie manuelle du secret de webhook en dev.
  4. *Rotation* de la clé de chiffrement : hors périmètre, mais le format doit permettre un identifiant de version.
  5. *Cours déjà publiés à la déconnexion* : proposition — ils restent visibles mais non achetables (le checkout revalide le statut du compte), plutôt que repassés en brouillon.
  6. *Ventes déjà faites sur le compte de la plateforme* : confirmer qu'il n'existe que des achats de test.
- Référence Podia : réglages de paiement du créateur

---

## Story s20-checkout-per-prof — Paiements sur le compte du prof

**As a** élève **I want** payer sur le compte Stripe du prof **so that** le prof reçoit 100% du montant (moins frais Stripe) sans passer par la plateforme.

### Complexity
3

### Acceptance criteria
- [ ] Le checkout résout le compte uniquement depuis `course.profId`, revalide qu'il est `ACTIVE` et crée la session avec la clé de ce prof ; sinon message clair, aucun appel à Stripe et aucun repli sur une clé globale
- [ ] Le webhook est reçu sur un endpoint propre au prof ; sa taille est limitée (valeur documentée) avant lecture, puis la signature est vérifiée sur le corps brut avec le secret de ce prof avant tout parsing du JSON
- [ ] Un `profId` inconnu ou un secret absent / invalide reçoit une réponse générique qui ne révèle pas l'existence du prof
- [ ] Après vérification de la signature, l'événement est refusé si `course.profId !== profId` : aucun `Purchase` ni `PaymentIssue` n'est écrit (cas testé)
- [ ] La page de succès traite `courseId` comme un simple indice : après récupération de la session sur le compte du prof, elle vérifie `metadata.courseId`, `metadata.userId`, l'acheteur connecté et le prof du cours ; `session_id` est validé (format, longueur) avant tout appel Stripe ; en cas d'écart, aucune donnée du cours n'est affichée
- [ ] La page de succès affiche « paiement en attente » tant que le `Purchase` n'existe pas
- [ ] `PaymentIssue` conserve un instantané du `profId`, du `stripeAccountId` et du mode au moment du paiement, pour que le remboursement soit fait sur le bon compte Stripe
- [ ] Les variables `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` globales ne sont plus nécessaires au paiement

### Dependencies
s07-stripe-checkout, s19-prof-stripe-account

### Agentic notes
- `src/lib/stripe.ts` lève une erreur à l'import si `STRIPE_SECRET_KEY` est absente : le remplacer par une fabrique `getStripeForProf(profId)` (déchiffre la clé, instancie le client avec la même version d'API). Pas de cache entre requêtes.
- Checkout (`src/app/checkout/actions.ts`) : résoudre le prof via `course.profId`, refuser si pas de compte `ACTIVE`. `success_url` doit contenir le `courseId` pour que la page de succès retrouve le bon compte avant `sessions.retrieve`.
- Webhook : déplacer vers `src/app/api/webhooks/stripe/[profId]/route.ts`. Lire le secret du prof, vérifier la signature sur le corps brut (`constructEvent`, tolérance de timestamp de Stripe) puis **contrôler `course.profId === profId`** : sans ce contrôle, un prof pourrait fabriquer un événement signé par son propre compte pour s'octroyer l'accès au cours d'un autre prof. Conserver le reste (idempotence par session, `payment_status === "paid"`, `async_payment_succeeded`, `P2002` et `PaymentIssue`). Aucune réponse ne doit distinguer « prof inconnu » de « signature invalide ».
- Ancien endpoint `/api/webhooks/stripe` : si seuls des achats de test existent sur le compte de la plateforme (question 6 de s19), le supprimer et prévenir dans la PR que les endpoints Stripe de la plateforme sont à retirer du dashboard. S'il existe de vraies ventes, le garder temporairement en mode « drainage » (aucune nouvelle session, événements en vol traités) pendant une fenêtre documentée.
- `PaymentIssue` : ajouter `profId`, `stripeAccountId` et le mode (migration) plutôt que de les dériver du cours, dont le propriétaire peut changer. Mettre à jour la note de l'ADR 004 : le remboursement d'un double paiement se fait dans le Stripe du prof.
- Retirer les variables Stripe globales de `.env.example` et du workflow CI, qui ne fournira plus qu'une fausse clé de chiffrement de test. Le dépôt est public : aucune vraie clé en CI ni en test.
- À la livraison : cocher le critère « 100% » du plan s07, refaire la re-revue (`docs/reviews/s07-stripe-checkout.md`) et lever le blocage « Ship allowed: no » si le reste est satisfait.
- Tests : aucun appel Stripe réel ; couvrir le cas cross-prof (événement signé par le prof A pour un cours du prof B → refusé), prof sans compte, clé invalide (Stripe 401 → compte marqué invalide).
- Déploiement : les profs doivent connecter leur compte (s19) avant que leurs cours soient achetables ; appliquer les migrations ; abonner correctement les nouveaux endpoints.
- **À trancher dans le plan** : (a) *intention de checkout persistée* (prof, cours, acheteur, montant, devise, mode) que le webhook revérifie — protège contre une session créée avec un montant arbitraire via une clé compromise, au prix d'une table et de code ; sinon le montant reste seulement contrôlé `> 0` et en `eur` ; (b) idempotence par `event.id` en plus de la session (table d'événements traités), aujourd'hui non requise.
- Périmètre : paiement unique uniquement ; les abonnements (`customer.subscription.*`) relèvent de `s13-subscriptions`, qui dépend de cette story.
- Référence Podia : flow d'achat

---

# Stories v2 — MVP espaces de cours (recadrage du 2026-10-29)

> Exigences du dossier v2 citées entre crochets (ACC, PAR, AUD, MET, COM, EXT, PLN, BIL, DAT, UX). Toute story d'espace applique ADR 011 : gardes de `src/server/authz/`, FK composites `(accountId, spaceId, …)`, tests à deux professeurs et deux espaces.

---

## Story s21-postgres-switch — Passage à PostgreSQL

**As a** développeur **I want** que dev, CI et production utilisent PostgreSQL **so that** les verrous, FK composites et contraintes du MVP soient testés sur la vraie base.

### Complexity
3

### Acceptance criteria
- [ ] `prisma/schema.prisma` utilise le provider `postgresql` ; une migration de base PostgreSQL remplace l'historique SQLite
- [ ] `npm run dev`, `npm test` et `npm run build` fonctionnent contre un PostgreSQL local documenté (README + `.env.example`)
- [ ] La CI démarre un service PostgreSQL éphémère et les jobs « Types, tests and build » et « Lint » restent verts
- [ ] Les 408 tests existants passent (ou les écarts sont justifiés dans la revue)
- [ ] Un test d'intégration prouve qu'une transaction interactive avec `SELECT … FOR UPDATE` sérialise deux écritures concurrentes
- [ ] `dev.db` et l'adaptateur libsql ne sont plus nécessaires

### Dependencies
Aucune (premier lot M1)

### Agentic notes
- ADR 010. Prisma 7 : lire `node_modules/next/dist/docs/` et la doc Prisma 7 (adaptateur `@prisma/adapter-pg` ou driver natif) avant de changer `src/lib/prisma.ts` et `prisma.config.ts`.
- Vérifier qu'aucune donnée réelle n'existe en SQLite (dev uniquement) avant d'abandonner l'historique de migrations ; garder une sauvegarde de `dev.db` hors dépôt.
- Les migrations SQLite existantes (`prisma/migrations`) ne sont pas rejouables sur PostgreSQL : générer une migration initiale depuis le schéma courant.
- Les dossiers vides `docs/* 2`, `docs/* 3`, `prisma/migrations 2|3` et `.claude/skills/* 2|3` sont des doublons Finder : les supprimer dans cette story si confirmés vides.

---

## Story s22-email-verification — Vérification d'adresse et e-mails transactionnels

**As a** utilisateur **I want** vérifier mon adresse e-mail **so that** une invitation ne puisse être acceptée que par son vrai destinataire.

### Complexity
3

### Acceptance criteria
- [ ] Après inscription, un e-mail de vérification à jeton hashé et expirant est envoyé ; le jeton est à usage unique
- [ ] `User.emailVerifiedAt` est renseigné seulement après consommation du jeton
- [ ] Un jeton expiré, déjà utilisé ou falsifié affiche un message générique et permet un nouvel envoi limité en débit
- [ ] Les envois passent par un adaptateur `src/server/providers/email.ts` ; en dev/CI, un transport de test capture les messages (aucun envoi réel)
- [ ] Aucun jeton en clair n'est journalisé ni stocké

### Dependencies
s21-postgres-switch

### Agentic notes
- Réutiliser `src/lib/rate-limit.ts` (s19) pour les renvois.
- Fournisseur d'envoi à qualifier en M0 (SMTP Infomaniak candidat) ; variables serveur uniquement.
- La retouche de l'écran d'inscription passe par le design system v2.

---

## Story s23-plan-catalog — Catalogue de plans et plan effectif

**As a** exploitant **I want** des plans versionnés avec leurs fonctionnalités et quotas **so that** aucune limite ni aucun prix ne soit codé dans l'interface [PLN-01].

### Complexity
2

### Acceptance criteria
- [ ] Modèles `Plan` (key, version, published), `PlanPrice` (montant en centimes, devise, `stripePriceId` nullable, environnement test/live) et `PlanEntitlement` (featureKey allowlistée, enabled, limitValue, unit), unicité `(key, version)` et `(planId, featureKey)`
- [ ] Un seed crée le plan gratuit (sans prix payant) et des plans payants de **recette** marqués comme hypothèses
- [ ] `getEffectivePlan(accountId)` est calculé au serveur et renvoie fonctionnalités et quotas ; le métronome local n'est jamais une fonctionnalité limitée
- [ ] Un accès pilote (octroi explicite d'une fonctionnalité à un compte testeur) est possible et enregistré dans le journal d'audit ; il n'est pas présenté comme un abonnement
- [ ] Aucun composant ne contient de montant ni de quota en dur (vérifié par test ou lint ciblé)

### Dependencies
s21-postgres-switch

### Agentic notes
- Clés de fonctionnalité du dossier : `spaces`, `student_seats`, `audio_assignments`, `shared_metronome`, `audio_storage_bytes`, `custom_branding`.
- Créer ici `AuditEvent` (acteur, action, cible, requestId, métadonnées minimales, append-only) réutilisé ensuite.
- Le plan effectif dépendra des abonnements (s41) ; prévoir la fonction sans Stripe pour l'instant.

---

## Story s24-teacher-account-spaces — Compte professeur et espaces de cours

**As a** professeur **I want** créer mon compte professeur et un espace de cours **so that** j'organise mes élèves dans un lieu privé [ACC-01].

### Complexity
3

### Acceptance criteria
- [ ] Modèles `TeacherAccount` (owner unique au MVP, statut, plan effectif et version) et `CourseSpace` (accountId, nom, slug unique par compte, statut draft/active/read_only/archived)
- [ ] La création d'espace vérifie le quota `spaces` dans une transaction qui verrouille le compte ; deux créations concurrentes ne dépassent pas la limite
- [ ] Module `src/server/authz/` : `getActor`, `ownsAccount`, `ownsSpace`, `isSpaceMember` relus en base ; le rôle du JWT n'est jamais lu
- [ ] Un professeur B qui appelle une action ou une page avec l'identifiant d'un espace de A obtient une réponse « introuvable »
- [ ] Les espaces listés sont uniquement ceux possédés ou rejoints par l'utilisateur

### Dependencies
s22-email-verification, s23-plan-catalog

### Agentic notes
- ADR 011. Les profs existants (`role = PROF`) reçoivent un `TeacherAccount` par migration de données additive.
- Préparer la convention FK composite : `@@unique([accountId, id])` sur `CourseSpace` et FK `(accountId, spaceId)` sur les tables enfants (SQL dans la migration si Prisma ne l'exprime pas).
- UI minimale (formulaire de création) ; le cadre complet arrive avec s25.

---

## Story s25-space-shell — Cadre de navigation façon Discord

**As a** professeur ou élève **I want** un rail d'espaces, des rubriques et un panneau de contexte **so that** je sache toujours dans quel espace et quelle rubrique je suis [UX-01].

### Complexity
3

### Acceptance criteria
- [ ] Rail des espaces autorisés (nom accessible pour chaque initiale), navigation de l'espace par groupes Apprendre / Classe / Outils, centre, contexte repliable
- [ ] Le groupe « Gestion » (Élèves, Contenus, Offre et usage) n'est rendu que pour le propriétaire, et les routes correspondantes refusent un élève côté serveur
- [ ] Sur mobile : un seul contenu principal, tiroirs avec focus piégé, fermeture par Échap et retour du focus au déclencheur
- [ ] États vides réels (aucun espace, aucun parcours) sans fausses données
- [ ] Navigation au clavier de bout en bout ; contrastes des tokens v2 vérifiés

### Dependencies
s24-teacher-account-spaces ; design system v2 réécrit (`/ks-design-system`, ADR 013)

### Agentic notes
- Story avec interface : `/ks-design` obligatoire, sur la base du wireframe `assets/direction-discord.svg` du dossier v2.
- Routes proposées : `/espaces`, `/espaces/[spaceId]/accueil` ; composants `SpaceRail`, `SpaceNavigation`, `WorkspaceHeader`, `ContextPanel`.
- Pas de violet Discord, pas de présence globale, pas de badges en cascade.

---

## Story s26-student-invitations — Invitations et places d'élèves

**As a** professeur **I want** inviter des élèves dans la limite de mon offre **so that** ils rejoignent mon espace sans dépasser mon quota [ACC-02, PLN-01].

### Complexity
4

### Acceptance criteria
- [ ] Modèles `StudentSeat` (reserved/active/released, clé d'adresse normalisée par HMAC serveur), `SpaceInvitation` (hash du jeton, expiration, révocation, acceptation) et `SpaceEnrollment` (unique espace/utilisateur)
- [ ] Créer une invitation réserve une place dans une transaction qui verrouille le compte ; deux invitations simultanées sur la dernière place n'en créent qu'une
- [ ] Un élève déjà compté sur ce compte ne consomme pas de seconde place en rejoignant un autre espace du même professeur
- [ ] L'acceptation exige une session dont l'adresse **vérifiée** correspond ; elle est atomique et à usage unique ; mauvais compte, jeton expiré ou révoqué donnent un message clair sans révéler l'espace
- [ ] Une invitation expirée ou révoquée libère sa place réservée si aucune inscription active ne l'utilise
- [ ] À la limite : message avec l'unité et le nombre de places, saisie conservée, liens vers gestion des invitations et offres ; rien n'est envoyé
- [ ] Écran Élèves et places : réservées, actives, expirées, archivage d'une inscription

### Dependencies
s25-space-shell

### Agentic notes
- **Risque (complexité 4)** : concurrence et cohérence place/inscription. Tests d'intégration PostgreSQL obligatoires (deux transactions parallèles).
- Expiration : job ou vérification paresseuse à la lecture ; à trancher au plan. Prévoir `OutboxJob` si l'envoi d'e-mail d'invitation est asynchrone.
- Route `/invitation/[token]` ; le jeton n'apparaît jamais dans les journaux.

---

## Story s27-learning-paths — Éditeur de parcours, modules et étapes

**As a** professeur **I want** construire un parcours en modules et étapes, puis le publier **so that** mes élèves aient une progression claire [PAR-01].

### Complexity
4

### Acceptance criteria
- [ ] Modèles `LearningPath` (draft/published/archived, version), `PathModule` et `PathStep` (kind read/practice/audio_assignment, consigne, position) avec FK composites vers l'espace
- [ ] Ordre persistant et réordonnancement transactionnel ; un ordre concurrent produit un conflit explicite, pas un ordre corrompu
- [ ] Brouillon et publication distincts ; un élève ne voit jamais un brouillon (test)
- [ ] Après publication, ajouter une étape conserve les identifiants existants
- [ ] Une étape qui a des rendus est archivée, jamais supprimée
- [ ] Aperçu « comme élève » pour le professeur ; statut de sauvegarde distinct de la publication ; saisie conservée en cas d'échec

### Dependencies
s25-space-shell

### Agentic notes
- **Risque (complexité 4)** : versionnement de la publication. Recherche à trancher : nouvelles tables v2 (recommandé, ADR 009) ou reprise de `Course/Module/Lesson` gelés ; réutiliser au minimum les patterns d'ordre et de formulaires de s03/s04.
- Story avec interface : `/ks-design` (écran S04 du dossier).

---

## Story s28-path-reader-progress — Lecture d'étape et progression de l'élève

**As a** élève **I want** retrouver ma prochaine étape et marquer celles que j'ai faites **so that** je sache quoi pratiquer sans relire un fil [PAR-02].

### Complexity
3

### Acceptance criteria
- [ ] Accueil d'espace : prochaine étape non réalisée du parcours publié, ou état vide « Ton professeur n'a pas encore publié de parcours »
- [ ] `StepProgress` (inscription, étape, todo/done) : l'élève ne modifie que sa propre progression, sur une étape publiée de son espace
- [ ] Progression persistante entre appareils ; aucune comparaison ni classement entre élèves
- [ ] Le professeur voit une synthèse minimale par élève (étapes réalisées)
- [ ] Un élève non inscrit ou révoqué ne lit pas le parcours (test)

### Dependencies
s27-learning-paths

### Agentic notes
- Écrans S03 et S05 du dossier. Pas de WebSocket ni de polling pour la lecture.

---

## Story s29-step-resources — Stockage privé et ressources d'étape

**As a** professeur **I want** joindre un PDF, une image ou un lien à une étape **so that** mes supports existants accompagnent la consigne.

### Complexity
3

### Acceptance criteria
- [ ] Adaptateur `src/server/providers/storage.ts` (URL présignées PUT/GET courtes, clé d'objet opaque) avec implémentation locale pour dev/CI ; aucun autre module ne connaît le fournisseur
- [ ] Modèles `Resource` et `StepResource` (même espace) ; type et taille vérifiés au serveur après transfert ; types et tailles maximales configurés
- [ ] Les liens externes sont en HTTPS, validés, jamais récupérés côté serveur ni prévisualisés automatiquement
- [ ] Un élève ne lit une ressource que via une étape publiée de son espace ; URL de lecture courte, jamais stockée
- [ ] Une ressource d'un autre espace ne peut pas être rattachée (test)

### Dependencies
s27-learning-paths

### Agentic notes
- ADR 012. Ce socle de stockage est réutilisé par les rendus audio (s34).
- Réponses privées en `Cache-Control: no-store`.

---

## Story s30-class-threads — Fils de classe

**As a** membre d'un espace **I want** lire les annonces du professeur, poser des questions et répondre **so that** la classe échange sans flux global [COM-01].

### Complexity
3

### Acceptance criteria
- [ ] `ClassThread` (annonce réservée au professeur, question pour les membres actifs) et `ClassComment`, limités à l'espace
- [ ] Pagination par curseur stable ; taille et cadence des messages bornées (limitation de débit)
- [ ] Aucun fichier audio de devoir ne peut être joint ou référencé dans un fil
- [ ] Pas de messagerie entre élèves, pas de push, pas de compteur global ni de `@everyone`
- [ ] Un membre d'un autre espace ne lit ni n'écrit (test)

### Dependencies
s25-space-shell

### Agentic notes
- Écran S08. Les notifications e-mail sobres viendront avec l'outbox ; hors périmètre ici si non nécessaires.

---

## Story s31-class-moderation — Signalement et masquage

**As a** professeur **I want** masquer un message signalé **so that** l'espace reste sain, avant toute inclusion de mineurs.

### Complexity
2

### Acceptance criteria
- [ ] Un membre peut signaler un fil ou un commentaire avec un motif ; le signalement n'est visible que du professeur
- [ ] Le professeur masque avec une raison ; l'action est inscrite dans le journal d'audit ; le contenu masqué n'est plus servi aux élèves
- [ ] Aucune suppression silencieuse

### Dependencies
s30-class-threads

### Agentic notes
- Modèle `ModerationReport` avec cibles vérifiées dans le même espace.

---

## Story s32-audio-assignments — Devoirs audio et destinataires

**As a** professeur **I want** créer un devoir audio rattaché à une étape et choisir ses destinataires **so that** chaque élève sache ce qu'il doit rendre [AUD-01].

### Complexity
3

### Acceptance criteria
- [ ] `AudioAssignment` (étape, consigne, draft/published/archived, version de politique) et `AssignmentRecipient` (unique devoir/inscription, même espace)
- [ ] La publication exige la fonctionnalité `audio_assignments` du plan effectif (ou un accès pilote audité) ; sinon explication, aucun bouton cassé
- [ ] La consigne affiche durée max, taille max, nombre de tentatives et durée de conservation lues depuis la politique centrale
- [ ] Rubrique « Mes devoirs » : un élève ne voit que ses attributions

### Dependencies
s28-path-reader-progress, s23-plan-catalog

### Agentic notes
- Politique audio versionnée et centralisée (120 s, 5 MiB, 3 tentatives, 90 jours en hypothèse) : une seule source.

---

## Story s33-audio-recorder — Enregistreur local et import

**As a** élève **I want** enregistrer ou importer mon jeu, le réécouter et recommencer **so that** j'envoie seulement ce que j'ai choisi [AUD-01].

### Complexity
4

### Acceptance criteria
- [ ] Un contrôleur unique possède micro, MediaRecorder, AudioContext, timers et URL Blob ; il libère tout à l'arrêt, à la fermeture, à l'abandon et si la permission arrive après l'abandon (tests avec périphériques simulés)
- [ ] Permission demandée uniquement au clic ; refus → aide courte, réessai volontaire ou import, sans boucle
- [ ] Choix de l'entrée, vumètre, durée, arrêt, réécoute, refaire, copie locale ; rien n'est transféré avant « Envoyer »
- [ ] Format choisi via `MediaRecorder.isTypeSupported` (Opus ou AAC selon navigateur) ; durée max appliquée à la capture
- [ ] Import d'un fichier compatible comme alternative ; fichier trop long ou trop lourd → limite expliquée, consigne conservée
- [ ] Module chargé à la demande (hors JS initial de l'espace)

### Dependencies
s32-audio-assignments ; matrice codecs/périphériques de M0

### Agentic notes
- **Risque (complexité 4)** : compatibilité navigateurs. Réemployer la gestion de permission, du niveau et de l'arrêt des pistes du prototype Riff Club Studio (archive `Riff-Club-Studio-source.zip`, tests `audio-lifecycle`).
- Aucune promesse de survie du Blob après fermeture de l'onglet ; avertir avant navigation.
- Écran S06, avec l'aide interface USB / ampli virtuel.

---

## Story s34-audio-submission-upload — Envoi fiable et vérification du rendu

**As a** élève **I want** que mon rendu arrive une seule fois et intact **so that** une coupure ou un double clic ne me fasse rien perdre [AUD-01, DAT-01].

### Complexity
4

### Acceptance criteria
- [ ] Intention d'envoi au serveur : devoir publié, élève destinataire inscrit, fonctionnalité active, tentatives et quota d'octets réservés atomiquement (`QuotaReservation` avec clé d'idempotence)
- [ ] Transfert direct vers le stockage par URL présignée courte ; même intention reprise après coupure ; double clic → un seul rendu, une seule tentative consommée
- [ ] Finalisation serveur : propriétaire de l'objet, type réel, taille et durée relues (jamais celles du client) ; échec → quarantaine puis suppression, professeur sans accès
- [ ] Le rendu passe à « envoyé » seulement après finalisation sûre ; l'interface distingue transfert et vérification
- [ ] Intention abandonnée → expiration et libération de la réservation (fenêtre configurable, 10 min en hypothèse)
- [ ] Fichier falsifié, trop gros, trop long, hors espace ou élève révoqué → refus (tests)

### Dependencies
s33-audio-recorder, s29-step-resources

### Agentic notes
- **Risque (complexité 4)** : idempotence et validation. Modèles `AudioSubmission` (unique destinataire/tentative) et `AudioRecording` (clé opaque, codec, durée réelle, statut, expiresAt).
- Mesure de durée côté serveur : choisir une lecture légère du conteneur (pas de transcodage) au plan.
- Introduire `OutboxJob` (lease, backoff, déduplication) pour la notification sobre au professeur.

---

## Story s35-audio-feedback — Écoute et retours horodatés

**As a** professeur **I want** commenter un passage précis du rendu et garder une note privée **so that** l'élève sache exactement quoi retravailler [AUD-02].

### Complexity
3

### Acceptance criteria
- [ ] Lecture après contrôle de droit (auteur ou professeur de l'espace) par URL courte (5 min) avec Range ; aucun autre élève ne reçoit l'URL ni les commentaires
- [ ] `AudioComment` : offset en millisecondes entières, `0 ≤ offset ≤ durée réelle` garanti en base (fonction ou trigger), brouillon puis publication
- [ ] « Aller à mm:ss » positionne la lecture sans la lancer ; champ de temps saisissable et liste textuelle équivalente (pas de glisser obligatoire)
- [ ] `PrivateNote` stockée séparément, jamais présente dans un DTO élève (test sur la réponse sérialisée)
- [ ] L'élève voit les retours publiés sur son rendu et reçoit un lien, jamais l'audio par e-mail

### Dependencies
s34-audio-submission-upload

### Agentic notes
- Écran S07. Waveform facultative, non requise par la story.

---

## Story s36-audio-retention — Expiration et purge des audios

**As a** exploitant **I want** que les audios expirent et soient purgés selon la politique annoncée **so that** le stockage reste borné et les engagements tenus [DAT-01].

### Complexity
3

### Acceptance criteria
- [ ] La date d'expiration est fixée à l'envoi et affichée à l'élève avant envoi et au professeur
- [ ] Un job purge les objets échus, rejetés ou orphelins (lease, reprise, idempotent) et marque le statut ; un changement de plan ne raccourcit pas la rétention
- [ ] Après purge, le rendu affiche « audio expiré » et les retours textuels selon la politique, sans erreur de lecteur
- [ ] Alertes : fichier orphelin, job ancien, quota incohérent

### Dependencies
s35-audio-feedback

### Agentic notes
- Le worker tourne sur l'hébergement retenu : qualifier en M0 la possibilité d'un processus ou d'une tâche planifiée chez Infomaniak.

---

## Story s37-local-metronome — Métronome local

**As a** élève ou professeur **I want** un métronome fiable dans l'espace **so that** je pratique au bon tempo, même sur le plan gratuit [MET-01].

### Complexity
2

### Acceptance criteria
- [ ] Tempo (30–240), mesure (2–7), volume, marche/arrêt accessibles au clavier ; aucun son sans geste explicite
- [ ] Clics programmés en avance sur l'horloge `AudioContext` (un intervalle JS ne sert qu'à remplir le planning) ; régularité testée
- [ ] Repère visuel doux, désactivable, respectant `prefers-reduced-motion`
- [ ] Arrêt et sortie ferment timers et AudioContext ; complet sur le plan gratuit

### Dependencies
s25-space-shell

### Agentic notes
- Réemployer le moteur du prototype (tests `music`, `pupitre`). Domaine pur dans `src/domain/music/`.

---

## Story s38-tool-sessions — Sessions d'outils et lien de visio externe

**As a** professeur **I want** ouvrir une session d'outils avec le lien de mon appel externe **so that** mes élèves rejoignent la visio et les outils au même endroit [EXT-01].

### Complexity
2

### Acceptance criteria
- [ ] `ToolSession` (prepared/open/closed, epoch) et `ToolSessionMember` (élèves admis explicitement)
- [ ] Lien HTTPS validé (protocole, longueur, hôte), texte échappé, jamais récupéré côté serveur ni intégré ; ouverture volontaire dans un nouvel onglet avec le nom du service
- [ ] L'interface n'affiche aucun statut de connexion à l'appel externe
- [ ] Seuls les élèves admis voient le lien (test)

### Dependencies
s37-local-metronome, s26-student-invitations

### Agentic notes
- Allowlist de fournisseurs (Jitsi, Meet, Zoom) et exceptions à décider au plan.

---

## Story s39-shared-metronome-state — État partagé du métronome

**As a** professeur **I want** régler tempo, départ et arrêt pour toute la session **so that** chaque élève suive la même consigne de tempo [MET-02].

### Complexity
3

### Acceptance criteria
- [ ] `MetronomeState` (revision, schemaVersion, tempoBpm, beatsPerBar, stopped/running, startAtServerMs, countInBars) et `ControlMutation` (session, mutationId) pour l'idempotence
- [ ] `PUT` d'état réservé au propriétaire, avec `expectedRevision` ; révision périmée → 409 ; même `mutationId` rejoué → même résultat
- [ ] Le serveur fixe le départ futur (+2 s en hypothèse) ; `GET /time` renvoie l'heure serveur
- [ ] La fonctionnalité `shared_metronome` du plan est exigée ; le métronome local reste disponible sans elle
- [ ] Un élève ne peut émettre aucune commande (test)

### Dependencies
s38-tool-sessions

### Agentic notes
- Le contrat du dossier v2 (TRD §6) fait référence ; charge ≤ 2 KiB.

---

## Story s40-shared-metronome-sync — Diffusion temps réel et clic synchronisé

**As a** élève **I want** que mon clic local démarre au moment fixé par le professeur **so that** nous jouions ensemble au plus près, sans flux audio [MET-02].

### Complexity
4

### Acceptance criteria
- [ ] Canal temps réel privé par session et epoch, ouvert seulement pendant l'usage de l'outil ; publication uniquement par le serveur après commit
- [ ] Estimation du décalage d'horloge par plusieurs échanges (échantillons à faible RTT) et correspondance avec l'horloge audio
- [ ] Le client n'applique qu'une révision plus récente, relit l'API après coupure et propose le prochain début de mesure au lieu d'une rafale de rattrapage
- [ ] Écart affiché (« non aligné ») et action « Se recaler » ; l'élève peut couper son son sans arrêter les autres ; « Arrêter pour tous » réservé au professeur
- [ ] Révocation : rotation de l'epoch, l'ancien canal ne reçoit plus de contrôle ; sortie → canal, timers et AudioContext fermés
- [ ] Aucun message par battement ; aucune piste audio transportée (inspection réseau)

### Dependencies
s39-shared-metronome-state ; preuve de timing M0

### Agentic notes
- **Risque (complexité 4)** : choix du transport temps réel (WebSocket dédié, SSE + API, ou service managé) à trancher par ADR dans la recherche, selon ce que l'hébergement Infomaniak supporte (M0).
- Aucune promesse de synchronisation parfaite dans les textes.

---

## Story s41-teacher-subscription — Abonnement professeur

**As a** professeur **I want** passer à une offre payante **so that** j'aie plus d'élèves, les devoirs audio et le métronome partagé [BIL-01].

### Complexity
4

### Acceptance criteria
- [ ] Écran Offre et usage : usage (places réservées/actives, espaces, stockage) et comparaison des plans publiés, montants lus du catalogue
- [ ] Checkout en mode abonnement créé au serveur avec le `stripePriceId` du plan choisi et le client Stripe du compte ; jamais un montant venant du client
- [ ] Webhook `/api/webhooks/stripe` : signature sur corps brut, `WebhookInbox` (unicité provider/événement), traitement idempotent et ordre indifférent (relecture canonique de l'abonnement)
- [ ] Le plan premium n'est actif qu'après rapprochement facture payée + abonnement éligible ; le simple retour de Checkout affiche « confirmation en cours »
- [ ] Modèles `Subscription` et `BillingInvoice` (factures du professeur uniquement)
- [ ] Un élève ne voit aucune information de facturation (test)

### Dependencies
s23-plan-catalog, s26-student-invitations

### Agentic notes
- **Risque (complexité 4)** : ADR 009. L'ancienne route `/api/webhooks/stripe` (s07, gelée) est à remplacer ou renommer : trancher dans la recherche, sans casser les tests gelés sans le dire.
- Tests sans appel Stripe réel ; dépôt public : jamais de clé, même factice, en clair (assembler à l'exécution).

---

## Story s42-billing-lifecycle — Portail, impayé, résiliation et retour au gratuit

**As a** professeur **I want** gérer ou résilier mon abonnement sans perdre mes contenus **so that** je reste maître de mon offre [BIL-01, PLN-01].

### Complexity
3

### Acceptance criteria
- [ ] Accès au portail client Stripe ; résiliation à échéance avec date de fin claire
- [ ] `past_due` → période de grâce configurable (7 jours en hypothèse) et message discret au professeur seulement
- [ ] Retour au gratuit : contenus lisibles et exportables, nouvelles créations bornées, choix de l'espace actif, nouveaux dépôts audio indisponibles, corrections des rendus déjà reçus toujours possibles
- [ ] Aucune suppression automatique d'élèves ni de contenus ; rétention audio inchangée

### Dependencies
s41-teacher-subscription, s36-audio-retention

### Agentic notes
- Écran S12 complet (gratuit, confirmation en cours, actif, grâce, résiliation, retour gratuit).

---

## Story s43-data-export-deletion — Export et suppression des données

**As a** utilisateur **I want** exporter mes données et supprimer mon compte **so that** j'exerce mes droits sans payer [DAT-01].

### Complexity
3

### Acceptance criteria
- [ ] Export (professeur : espaces, parcours, retours ; élève : progression, rendus encore conservés, retours) disponible 7 jours, sans abonnement requis
- [ ] Suppression orchestrée : détachement de l'identité, anonymisation des références à conserver, purge des données sans base de conservation, factures conservées selon politique
- [ ] Journaux sans audio, notes, jetons ni URL signées (test sur le format des logs)

### Dependencies
s42-billing-lifecycle

### Agentic notes
- Écran S13. Politique de conservation des factures à confirmer (conseil compétent).

---

## Story s44-pilot-readiness — Recette et préparation du pilote

**As a** exploitant **I want** une version candidate vérifiée et des procédures d'exploitation **so that** le pilote démarre sans risque de perte ou de fuite.

### Complexity
3

### Acceptance criteria
- [ ] Audit RGAA ciblé des parcours critiques et corrections bloquantes faites ; aucune conformité globale annoncée
- [ ] Exercice de restauration base + objets réussi et chronométré (RPO 24 h, RTO 4 h visés)
- [ ] Runbooks : paiement non rapproché, fichier rejeté/orphelin, incident de confidentialité, modération, rollback
- [ ] Budgets mesurés (JS initial ≤ 180 KiB, LCP/INP/CLS, P95 API) et écarts documentés
- [ ] Environnements dev / recette / production séparés, secrets dédiés

### Dependencies
s43-data-export-deletion, s40-shared-metronome-sync

### Agentic notes
- Story essentiellement d'exploitation : le plan liste des vérifications plutôt que du code.

---

## Story s45-minor-authorization — Parcours d'autorisation pour élèves mineurs

**As a** élève mineur et son responsable légal **I want** une information adaptée et une autorisation vérifiable **so that** je puisse participer dans un cadre conforme [DAT-01].

### Complexity
4

### Acceptance criteria
- [ ] **Bloquée** tant que le protocole d'information/autorisation n'est pas validé par David et un conseil compétent ; aucun critère ne sera écrit avant
- [ ] Aucune date de naissance complète ni pièce d'identité collectée par défaut

### Dependencies
Protocole juridique validé ; s34-audio-submission-upload

### Agentic notes
- Modèle cible du dossier : `MinorAuthorization` (finalité, statut, version de politique, preuve minimale). Ne pas commencer sans protocole.
