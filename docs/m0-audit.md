# M0 — Audit de l'existant et preuves terrain

> Lot M0 du plan d'implémentation v2 (dossier `Riff-Club-Dossier-Produit/07-Plan-Implementation.md` §3). Ouvert le 2026-10-29. Ce fichier suit l'avancement de M0 : la partie audit est faite ; les preuves terrain demandent du matériel et des testeurs, et reviennent à David.

## 1. Dépôt de production identifié

- Dépôt : `greenpulsedigital/masterguitar` (public), copie locale `/Volumes/Mac ssd/masterguitar`, `main` à `baf89b4` au 2026-10-29.
- Stack réelle : Next.js 16.2, React 19.2, Prisma 7.9 en **SQLite** (adaptateur libsql), NextAuth 5 beta (Credentials, JWT, rôle global `STUDENT/PROF`), Stripe 22, shadcn/ui base-nova, Tailwind 4, Vitest (408 tests au 2026-10-05), CI GitHub (« Types, tests and build », « Lint »).
- Méthode de travail : pipeline killer-saas (`AGENTS.md`) ; aucune ligne de code sans plan validé.
- Le prototype « Riff Club Studio » (HTML/CSS/JS, archive `Riff-Club-Studio-source.zip`) n'est pas dans ce dépôt ; il sert de référence pour l'audio et le moteur musical.

## 2. Inventaire et réemploi

| Élément existant | Fichiers | Décision v2 |
|---|---|---|
| Inscription, connexion, déconnexion | `src/app/(auth)/*`, `src/lib/auth.ts` | Réutilisés ; ajouter la vérification d'adresse (s22) ; le rôle du JWT n'autorise plus rien (ADR 011) |
| Garde `requireProf` (rôle relu en base) | `src/lib/require-prof.ts` | Pattern repris dans `src/server/authz/` (s24) ; le fichier reste pour les écrans gelés |
| Limitation de débit en base | `src/lib/rate-limit.ts`, modèle `RateLimit` | Réutilisée (renvoi d'e-mail, fils de classe, invitations) |
| Chiffrement AES-256-GCM versionné | `src/lib/stripe-keys.ts` | Gelé avec s19 ; pattern réutilisable si un secret doit être chiffré |
| CRUD cours, modules, leçons, slug | `src/app/(dashboard)/dashboard/courses/*`, `src/components/module-*`, `lesson-*` | Gelés ; patterns d'ordre et de formulaires repris dans s27 |
| Page de vente, checkout, webhook, paiements prof | `src/app/cours`, `src/app/checkout`, `src/app/api/webhooks/stripe`, `settings/payments` | Gelés (ADR 009) ; la route webhook sera remplacée ou renommée en s41 |
| Thème « Bois & Ambre » clair | `src/app/globals.css`, `docs/design-system.md` | Remplacé (ADR 013) via `/ks-design-system` |
| Schéma SQLite et migrations | `prisma/` | Remplacés par une base PostgreSQL (s21, ADR 010) |

Points d'attention relevés pendant l'audit :
- Dossiers vides en double (`docs/decisions 2`, `docs/plans 3`, `prisma/migrations 2`, `.claude/skills/* 2`…) : doublons Finder, à supprimer dans s21 après vérification.
- Fichiers `tailwindcss-*.log` à la racine : à ignorer dans `.gitignore` s'ils ne le sont pas.
- PR #36 (`docs/prd-sans-tablatures`, ouverte) retire les tablatures du périmètre v1 ; le PRD v2 les place déjà après MVP. La PR devient sans objet après fusion du recadrage.
- Revue s19 restée en cours et s07 en `Ship allowed: no` : sans effet sur le MVP v2 (ADR 009).

## 3. Décisions de stack prises en M0

| Sujet | Décision | Référence |
|---|---|---|
| Modèle économique | Abonnement du professeur, vente élève gelée, s20 abandonnée | ADR 009 |
| Base et migrations | PostgreSQL partout, Prisma seul | ADR 010 |
| Auth et autorisation | NextAuth conservé, gardes serveur + FK composites, pas de RLS au MVP | ADR 011 |
| Fichiers | Stockage objet privé S3-compatible derrière un adaptateur | ADR 012 |
| Identité visuelle | Thème sombre noir/brun/cuivre unique | ADR 013 |
| Temps réel | Reporté à s40, selon ce que l'hébergement permet | à venir |

## 4. Qualifications techniques restantes (avant données réelles)

- [ ] **Hébergement Infomaniak (offre Node)** : build Next.js 16, port, sessions, corps brut des webhooks Stripe, processus de fond ou tâche planifiée pour l'outbox et les purges, WebSocket ou SSE possibles ?
- [ ] **PostgreSQL** : offre managée disponible (Infomaniak ou autre), version, région, sauvegardes et restauration.
- [ ] **Stockage objet** : URL présignées PUT/GET, requêtes Range, CORS, région, coût au Go et au trafic.
- [ ] **E-mail transactionnel** : fournisseur, région, domaine d'envoi (SPF/DKIM).
- [ ] Liste des sous-traitants et régions, pour l'information des utilisateurs.

## 5. Preuves terrain (David)

Ces preuves exigent du vrai matériel ; aucune n'a été réalisée à ce jour.

### Audio (bloque s33/s34)
- [ ] Capture puis lecture croisée : ordinateur (Chrome, Firefox, Safari), iPhone (Safari), Android (Chrome). Noter pour chaque couple : format produit (`MediaRecorder.isTypeSupported`), lecture possible sur les autres appareils.
- [ ] Interface USB + ampli virtuel : l'entrée est-elle sélectionnable, le son est-il exploitable ?
- [ ] Refus de permission puis réessai ; import d'un fichier comme alternative.
- [ ] Micro bien coupé à l'arrêt, à la fermeture de l'onglet et en cas d'abandon (voyant système éteint).
- [ ] Poids réel de captures de 60 s et 120 s : confirmer ou réviser 120 s / 5 MiB / 3 tentatives / 90 jours.

### Timing du métronome (bloque s40)
- [ ] Deux appareils sur deux réseaux différents, clic Web Audio local, départ fixé par une heure serveur : mesurer l'écart au départ et après 2 minutes.
- [ ] Onglet suspendu puis repris, Bluetooth : l'écart est-il visible et « Se recaler » suffit-il ?

### Usage (bloque s25 et la suite du design)
- [ ] Faire essayer le wireframe Discord du dossier à au moins un professeur familier de Discord et un non familier.
- [ ] Tâches parcours → rendu → retour sur maquette ; noter réussites, erreurs, aide nécessaire.

### Juridique (bloque s45 et l'inclusion de mineurs)
- [ ] Protocole d'information et d'autorisation pour élèves mineurs, validé avec un conseil compétent.

## 6. Sortie de M0

M0 est terminé quand : les ADR de stack sont acceptés (fait, PR de recadrage), la matrice codecs/périphériques est remplie (§5), les règles de rétention sont confirmées ou révisées, et la maquette Discord a été essayée. **Si un rendu ne s'écoute pas d'un navigateur à l'autre, ou si l'arrêt laisse le micro actif, corriger avant la chaîne serveur (s34).** M1 (s21 à s26) peut démarrer dès la fusion du recadrage : il ne dépend pas des preuves audio.
