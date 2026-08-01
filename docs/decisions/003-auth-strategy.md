# ADR 003 — Stratégie d'authentification

- Status: accepted
- Date: 2026-07-31
- Scope: framing

## Context

MasterGuitar a deux types d'utilisateurs :
- **Profs** : créent et vendent des cours
- **Élèves** : achètent et consomment des cours

Un même utilisateur peut être les deux (un prof peut acheter les cours d'un autre prof).

## Decision

- **NextAuth.js v5** avec Credentials provider (email + mot de passe)
- **Rôles** : `STUDENT` (défaut), `PROF`
- **Session** : JWT stocké en cookie httpOnly
- **Protection** : middleware Next.js redirige vers `/login` si non authentifié

Le rôle `PROF` est attribué :
- À l'inscription si l'utilisateur choisit "Je suis prof"
- Ou via upgrade depuis le dashboard (futur scope)

## Considered options

- **Credentials (email/password)** — retenu. Simple, pas de dépendance externe, contrôle total.
- OAuth (Google, GitHub) — rejeté pour MVP. Ajoute de la complexité, les profs de guitare préfèrent l'email.
- Magic links — rejeté. UX moins fluide (aller dans sa boîte mail), complexité SMTP.

### Session strategy
- **JWT** — retenu. Stateless, pas de DB hit à chaque requête, scale bien.
- Database sessions — rejeté. Overhead inutile pour ce projet.

## Consequences

- Le mot de passe est hashé (bcrypt ou argon2) avant stockage.
- Le JWT contient `userId`, `email`, `role` — pas de données sensibles.
- Le middleware lit le JWT et redirige si absent ou invalide.
- Pour les Server Components, `auth()` de NextAuth renvoie la session.
