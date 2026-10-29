# ADR 011 — Autorisation au serveur applicatif, isolation par contraintes en base

- Status: accepted
- Date: 2026-10-29
- Scope: framing
- Amends: ADR 003 (stratégie d'authentification)

## Context
Le dossier v2 exige qu'un élève de l'espace A n'accède jamais à l'espace B, qu'un propriétaire ne contrôle que ses espaces et qu'aucun droit ne vienne d'un rôle porté par le client. Il proposait la RLS Supabase. Avec Prisma + NextAuth (ADR 010), l'application se connecte avec un seul rôle PostgreSQL : la RLS ne protège rien sans propager l'identité à chaque transaction.

ADR 003 et le code actuel (`User.role` = `STUDENT | PROF`, rôle copié dans le JWT, relu en base par `requireProf`) décrivent un rôle global. En v2, être professeur signifie posséder un `TeacherAccount` ; être élève signifie avoir une inscription active dans un espace. Une même personne peut être les deux.

## Decision
- **Toute décision d'accès est prise au serveur**, dans un module unique `src/server/authz/` : résolution de l'acteur depuis la session (identifiant seulement), puis relecture en base de la propriété du compte (`ownsAccount`) ou de l'inscription active (`isSpaceMember`). Le rôle du JWT n'est jamais une autorisation. Les Server Actions et routes appellent ces gardes explicitement ; le middleware ne fait que rediriger.
- **L'isolation est aussi garantie par la base** : chaque table d'espace porte `accountId` et `spaceId`, avec des FK composites vers le parent ; une ressource hors périmètre répond comme inexistante (404).
- Chaque story ajoute des **tests à deux professeurs et deux espaces** (changer un identifiant ne donne aucun accès).
- **RLS PostgreSQL non activée au MVP.** Elle reste une défense en profondeur possible plus tard (identité propagée par `set_config` dans les transactions), à décider par un nouvel ADR.
- `User.role` est conservé pour les écrans gelés de v1 ; le nouveau code ne le lit pas.

## Considered options
- RLS dès M1 avec Prisma (`set_config('app.profile_id', …)` par transaction) — rejeté pour le MVP : complexité et risque d'oubli de contexte élevés pour un développeur seul ; à réévaluer avant l'inclusion de mineurs.
- Supabase Auth + RLS natives — rejeté avec ADR 010.
- Garder le rôle global `PROF/STUDENT` — rejeté : ne modélise ni la propriété d'un compte, ni l'appartenance à un espace précis.

## Consequences
- Le risque principal est un oubli de garde dans une action : la revue de chaque story vérifie la présence de `src/server/authz` sur toute lecture ou mutation d'espace, et les tests à deux espaces.
- Divergence assumée avec le dossier v2 (TRD §3, Backend §8 « RLS sur toutes les tables exposées ») : à signaler dans le dossier lors de sa prochaine révision.
