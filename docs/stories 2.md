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
s07-stripe-checkout

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
