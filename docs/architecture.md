# Architecture — masterguitar (v2)

> Recadrage du 2026-10-29 (PRD v2, ADR 009 à 013). La spécification détaillée vit dans le dossier produit v2 (`Riff-Club-Dossier-Produit` : TRD, App flow, Backend schema) ; ce document fixe le **comment** propre à ce dépôt et prévaut quand les deux divergent (notamment ADR 011 sur la RLS). L'architecture v1 (vente de cours) reste dans l'historique git.

## Stack

| Layer | Technology | Version | Décision |
|-------|------------|---------|----------|
| Framework | Next.js (App Router) | 16.x | ADR 002 |
| Language | TypeScript | 5.x | |
| UI | React + shadcn/ui (base-nova) | React 19.x | |
| Styling | Tailwind CSS v4, thème sombre noir/brun/cuivre | 4.x | ADR 013 |
| Database | PostgreSQL (dev, CI, prod) + Prisma, ORM et migrations uniques | Prisma 7.x | ADR 010 |
| Auth | NextAuth.js v5 (Credentials, JWT), e-mail vérifié | 5.x beta | ADR 003, 011 |
| Autorisation | Gardes serveur `src/server/authz/` + FK composites | — | ADR 011 |
| Fichiers | Stockage objet privé S3-compatible (fournisseur à qualifier) | — | ADR 012 |
| Paiements | Stripe Billing : abonnement du professeur, portail client | stripe 22.x | ADR 009 |
| Temps réel | Commandes du métronome partagé seulement ; transport à trancher (s40) | — | ADR à venir |
| E-mail | Adaptateur SMTP/API transactionnel (fournisseur à qualifier) | — | s22 |
| Hébergement visé | Infomaniak (application Node) — à qualifier en M0 | — | `docs/m0-audit.md` |
| Icons | Lucide React | 1.x | |

Hors stack MVP : LiveKit/SFU/TURN, Mux, Stripe Connect, Supabase.

## Repo structure

```
src/
├── app/
│   ├── (auth)/                 # connexion, inscription, vérification d'adresse
│   ├── espaces/                # application v2 : /espaces/[spaceId]/…
│   ├── invitation/[token]/     # acceptation d'invitation
│   ├── compte/                 # offre, abonnement, données
│   ├── api/                    # webhooks Stripe, /api/v1/* si une route est nécessaire
│   ├── (dashboard)/ checkout/ cours/   # v1 gelée (ADR 009) — ne pas étendre
│   └── layout.tsx, globals.css
├── components/
│   ├── ui/                     # primitives shadcn/ui
│   └── [feature]/              # composants partagés (shell Discord, audio…)
├── domain/music/               # moteur musical pur (métronome, plus tard manche)
├── server/
│   ├── authz/                  # acteur, propriété du compte, inscription à l'espace
│   ├── providers/              # stripe, storage, email, realtime (adaptateurs)
│   └── jobs/                   # outbox, purge, expirations
├── lib/                        # prisma, auth, utilitaires existants
├── generated/prisma/           # client Prisma (gitignored)
└── hooks/
prisma/schema.prisma            # modèle unique ; SQL brut dans les migrations Prisma
```

Les modules de fonctionnalité (espaces, parcours, devoirs, classe, outils, facturation) colocalisent leurs actions et composants sous la route qui les sert, conformément à la règle de colocation ; le code partagé par plusieurs routes va dans `src/server/` ou `src/components/[feature]/`.

## Patterns & conventions

Conventions de nommage et règles générales inchangées (voir `AGENTS.md`) : fichiers kebab-case, composants PascalCase, tables Prisma PascalCase, champs camelCase, Server Components par défaut, Server Actions pour les mutations, mobile-first, imports `@/`, pas de barrel, pas de `any`.

Règles ajoutées par la v2 :
1. **Autorisation explicite** : toute lecture ou mutation d'espace appelle une garde de `src/server/authz/` relue en base ; le rôle du JWT n'est jamais une autorisation ; une ressource hors périmètre répond « introuvable ».
2. **Isolation en base** : chaque table d'espace porte `accountId` et `spaceId` ; FK composites vers le parent (SQL dans la migration si Prisma ne l'exprime pas).
3. **Transactions verrouillées** pour les quotas : la ligne `TeacherAccount` est verrouillée (`FOR UPDATE`) dans toute transaction qui crée un espace, réserve une place ou réserve un upload.
4. **Idempotence** : clés `mutationId` / `idempotencyKey` sur les envois audio, contrôles de métronome et événements Stripe.
5. **Aucun montant ni quota en dur** : tout vient de `getEffectivePlan(accountId)`.
6. **Confidentialité par les données** : les DTO élève ne contiennent jamais les champs privés (notes, autres rendus) ; on ne masque pas en CSS.
7. **Sobriété** : pas de socket ni de polling hors outil partagé actif ; modules audio chargés à la demande ; réponses privées en `no-store`.
8. **Journaux** sans audio, notes, jetons, mots de passe ni URL signées.

## Data model (logique)

Le schéma Prisma détaillé est écrit story par story. Correspondance avec le schéma logique du dossier v2 (Backend schema §3 à §8) :

| Domaine | Modèles Prisma | Story |
|---|---|---|
| Identité | `User` (+ `emailVerifiedAt`), `EmailVerificationToken` | s22 |
| Plans | `Plan`, `PlanPrice`, `PlanEntitlement`, `AuditEvent` | s23 |
| Comptes et espaces | `TeacherAccount`, `CourseSpace` | s24 |
| Places et inscriptions | `StudentSeat`, `SpaceInvitation`, `SpaceEnrollment` | s26 |
| Parcours | `LearningPath`, `PathModule`, `PathStep`, `StepProgress` | s27, s28 |
| Ressources | `Resource`, `StepResource` | s29 |
| Classe | `ClassThread`, `ClassComment`, `ModerationReport` | s30, s31 |
| Devoirs audio | `AudioAssignment`, `AssignmentRecipient`, `AudioSubmission`, `AudioRecording`, `QuotaReservation`, `AudioComment`, `PrivateNote` | s32 à s36 |
| Outils | `ToolSession`, `ToolSessionMember`, `MetronomeState`, `ControlMutation` | s38 à s40 |
| Facturation | `Subscription`, `BillingInvoice`, `WebhookInbox` | s41, s42 |
| Exploitation | `OutboxJob` | s26 ou s34 (première story qui en a besoin) |
| Mineurs | `MinorAuthorization` | s45 (bloquée) |

Modèles v1 gelés, conservés sans extension : `Course`, `Module`, `Lesson`, `Purchase`, `PaymentIssue`, `ProfStripeAccount`. `RateLimit` (s19) est réutilisé.

Conventions de données : identifiants `cuid()` (existant) ou UUID, à fixer dans s24 et appliquer partout ensuite ; dates UTC ; montants en centimes ; positions audio en millisecondes entières.

## Integration points

### Auth (NextAuth.js v5)
- Credentials (e-mail + mot de passe), sessions JWT portant **seulement** l'identifiant utilisateur pour l'autorisation.
- Vérification d'adresse obligatoire avant d'accepter une invitation (s22).
- Mutations par cookies : contrôle d'origine (Server Actions) ; retour de connexion limité aux chemins internes.

### Paiements (Stripe Billing — ADR 009)
- Checkout en mode `subscription` sur le compte Stripe de la plateforme, Price ID choisi au serveur depuis `PlanPrice`.
- Portail client pour moyen de paiement, factures et résiliation.
- Webhook signé (corps brut) → `WebhookInbox` idempotente → rapprochement facture/abonnement → plan effectif + outbox, dans une transaction.
- Plus de Stripe Connect ni de clés de professeurs pour le nouveau parcours ; le code s19 reste gelé.

### Stockage objet (ADR 012)
- URL présignées courtes (envoi direct, lecture 5 min avec Range), clés opaques, finalisation serveur qui relit taille, type et durée.
- Adaptateur local pour dev/CI.

### Temps réel (s40)
- Commandes de métronome uniquement, publiées par le serveur après commit ; client en lecture.
- Transport à décider par ADR selon l'hébergement (WebSocket dédié, SSE, service managé).

### Visio externe
- Lien HTTPS stocké et validé, ouvert volontairement ; aucun embed, aucun fetch serveur, aucun statut d'appel.

### E-mail (s22)
- Vérification d'adresse, invitations, notifications sobres via outbox ; aucun audio en pièce jointe.

## Design / UX

Design system v2 à réécrire (`/ks-design-system`, ADR 013) à partir du brief UI/UX v2 avant la story s25. Parcours clés :
1. **Professeur** : compte gratuit → espace → parcours (modules, étapes) → publication → invitations → première réalisation.
2. **Élève** : invitation → connexion avec adresse vérifiée → accueil d'espace → prochaine étape → réalisée.
3. **Devoir audio** : consigne → enregistrer ou importer → réécouter → envoyer → vérification → retour horodaté.
4. **Offre** : limite atteinte → gestion des places ou offres → Checkout → confirmation serveur.
5. **Outils** : session → lien d'appel externe → son local activé → tempo piloté par le professeur.

Cadre façon Discord : rail d'espaces (64–72 px), navigation de l'espace (224–256 px), centre fluide, contexte repliable (256–304 px) ; un seul contenu principal et des tiroirs sur mobile.
