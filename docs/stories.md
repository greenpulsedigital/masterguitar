# User Stories — MasterGuitar

> One story = one shippable slice, written to be executed by an agent.
> Id format: `s<number>-<short-slug>` — reused in every pipeline file and in the branch name.

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
3

### Acceptance criteria
- [ ] Le prof peut saisir sa clé API Stripe depuis `/dashboard/settings/payments` (clé restreinte recommandée, permissions minimales indiquées dans l'interface)
- [ ] La clé est vérifiée auprès de Stripe avant d'être enregistrée ; une clé invalide est refusée avec un message clair
- [ ] La clé est stockée chiffrée, jamais renvoyée au client ni écrite dans les logs ; seuls les 4 derniers caractères et le mode (test / live) sont affichés
- [ ] À la connexion, un endpoint webhook est créé automatiquement sur le compte du prof (événements `checkout.session.completed` et `checkout.session.async_payment_succeeded`) et son secret de signature est stocké chiffré
- [ ] Le prof peut déconnecter son compte : la clé et le secret sont supprimés, l'endpoint webhook est supprimé côté Stripe (au mieux) et ses cours deviennent non achetables
- [ ] Un prof sans compte Stripe valide ne peut pas publier un cours, et voit pourquoi (lien vers la page de paiement)
- [ ] Le statut du compte (non configuré / connecté / clé invalide) est visible dans le dashboard

### Dependencies
s02-prof-auth, s03-course-crud

### Agentic notes
- Décision de référence : ADR 004 (2026-10-04) — un compte Stripe par prof, sans Stripe Connect. La plateforme n'encaisse pas l'argent.
- **Story avec interface** : passer par `/ks-design` (page `/dashboard/settings/payments`, composants du design system uniquement).
- Modèle `ProfStripeAccount` séparé de `User` : `profId` unique, `encryptedSecretKey`, `keyLast4`, `mode` (test / live), `status`, `webhookEndpointId`, `encryptedWebhookSecret`, dates.
- Chiffrement : AES-256-GCM via `node:crypto`, clé de 32 octets dans une variable d'environnement dédiée (`STRIPE_KEYS_ENCRYPTION_KEY`, à documenter dans `.env.example`, jamais en base). Helper unique `src/lib/stripe-keys.ts` (chiffrer / déchiffrer) ; aucun autre code ne manipule la clé en clair.
- Vérification de la clé : un appel de lecture à Stripe avec la clé saisie (à choisir dans la doc, compatible avec une clé restreinte). Création du webhook : `webhookEndpoints.create` renvoie le secret de signature **une seule fois** (à confirmer dans la doc Stripe) — le stocker immédiatement. URL de l'endpoint : `<URL publique>/api/webhooks/stripe/<profId>` (réalisé dans s20).
- Server Actions `connectStripeAccount` / `disconnectStripeAccount` : rôle `PROF` obligatoire, validation Zod, `redirect()` hors des `try/catch` (leçon du dépôt), erreurs Stripe traduites en messages sans fuite de la clé.
- `toggleCourseStatus` : refuser le passage en `PUBLISHED` si le prof n'a pas de compte `ACTIVE`.
- Le dépôt est public et la CI n'utilise que de fausses valeurs : aucun test ne doit appeler Stripe ; mocker le client.
- **À trancher avant le plan** :
  1. *Clé collée ou OAuth Connect Standard ?* L'ADR retient les clés collées, mais stocker des clés secrètes de tiers est un risque (fuite de la base = accès aux comptes). Atténuations : clés restreintes, chiffrement, clé de chiffrement hors base. À reconfirmer ; un OAuth éviterait de stocker des clés mais change l'ADR.
  2. *Clés de test en production* : proposition — refusées en production, acceptées en développement.
  3. *Développement local* : Stripe n'atteint pas `localhost` ; prévoir Stripe CLI / tunnel, ou une saisie manuelle du secret de webhook en dev.
  4. *Rotation* de la clé de chiffrement : hors périmètre, mais le format doit permettre un identifiant de version.
  5. *Ventes déjà faites sur le compte de la plateforme* : confirmer qu'il n'existe que des achats de test.
- Référence Podia : réglages de paiement du créateur

---

## Story s20-checkout-per-prof — Paiements sur le compte du prof

**As a** élève **I want** payer sur le compte Stripe du prof **so that** le prof reçoit 100% du montant (moins frais Stripe) sans passer par la plateforme.

### Complexity
3

### Acceptance criteria
- [ ] Le checkout d'un cours crée la session Stripe avec la clé du prof du cours (plus de clé globale pour les paiements)
- [ ] Un cours dont le prof n'a pas de compte valide n'est pas achetable (message clair, aucun appel à Stripe)
- [ ] Le webhook est reçu sur un endpoint propre au prof et vérifié avec le secret de signature de ce prof
- [ ] Un événement signé par le compte d'un prof ne peut créer d'accès que pour les cours de ce prof
- [ ] La page de succès retrouve la session sur le compte du prof du cours et vérifie que l'utilisateur est l'acheteur
- [ ] Les doubles paiements (`PaymentIssue`) indiquent le prof concerné, pour que le remboursement soit fait sur son compte Stripe
- [ ] Les variables `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` globales ne sont plus nécessaires au paiement

### Dependencies
s07-stripe-checkout, s19-prof-stripe-account

### Agentic notes
- `src/lib/stripe.ts` lève une erreur à l'import si `STRIPE_SECRET_KEY` est absente : le remplacer par une fabrique `getStripeForProf(profId)` (déchiffre la clé, instancie le client avec la même version d'API). Pas de cache entre requêtes.
- Checkout (`src/app/checkout/actions.ts`) : résoudre le prof via `course.profId`, refuser si pas de compte `ACTIVE`. `success_url` doit contenir le `courseId` pour que la page de succès retrouve le bon compte avant `sessions.retrieve`.
- Webhook : déplacer vers `src/app/api/webhooks/stripe/[profId]/route.ts`. Lire le secret du prof, vérifier la signature sur le corps brut, puis **contrôler `course.profId === profId`** : sans ce contrôle, un prof pourrait fabriquer un événement signé par son propre compte pour s'octroyer l'accès au cours d'un autre prof. Conserver tout le reste (idempotence, `payment_status === "paid"`, `async_payment_succeeded`, `P2002` et `PaymentIssue`).
- L'ancien endpoint `/api/webhooks/stripe` est supprimé ; prévenir dans la PR que les endpoints Stripe de la plateforme sont à retirer du dashboard.
- `PaymentIssue` : ajouter `profId` (migration) ou le dériver du `courseId`. Mettre à jour la note de l'ADR 004 : le remboursement d'un double paiement se fait dans le Stripe du prof.
- Retirer les variables Stripe globales de `.env.example` et du workflow CI (qui fournit aujourd'hui de fausses valeurs).
- À la livraison : cocher le critère « 100% » du plan s07, refaire la re-revue (`docs/reviews/s07-stripe-checkout.md`) et lever le blocage « Ship allowed: no » si le reste est satisfait.
- Tests : aucun appel Stripe réel ; couvrir le cas cross-prof (événement signé par le prof A pour un cours du prof B → refusé), prof sans compte, clé invalide (Stripe 401 → compte marqué invalide).
- Déploiement : les profs doivent connecter leur compte (s19) avant que leurs cours soient achetables ; appliquer les migrations ; abonner correctement les nouveaux endpoints.
- Référence Podia : flow d'achat
