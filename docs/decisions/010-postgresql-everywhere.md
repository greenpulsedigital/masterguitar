# ADR 010 — PostgreSQL partout, Prisma comme unique accès aux données

- Status: accepted
- Date: 2026-10-29
- Scope: framing
- Supersedes: ADR 002-sqlite-local-dev

## Context
ADR 002-sqlite-local-dev a choisi SQLite pour le développement local (zéro installation). Le MVP v2 repose sur des garanties que SQLite n'offre pas ou mal : réservations concurrentes de places et de quotas (`SELECT … FOR UPDATE` sur le compte professeur), clés étrangères composites `(accountId, spaceId, id)` pour interdire les liens entre espaces, contraintes partielles (unicité des positions courantes), `timestamptz`, et un comportement identique entre dev, CI et production. Le dossier v2 proposait Supabase en hypothèse ; David a retenu le 2026-10-29 de garder Prisma + NextAuth et de passer à PostgreSQL.

## Decision
- **PostgreSQL** en développement, en CI et en production. Version cible : une version majeure supportée disponible chez l'hébergeur retenu (à qualifier en M0, voir `docs/m0-audit.md`).
- **Prisma 7** reste l'unique ORM et l'unique système de migrations (`prisma migrate`). Les contraintes que Prisma ne sait pas exprimer (FK composites, index partiels, CHECK, triggers d'offset audio) sont écrites en SQL dans les migrations Prisma, jamais dans un second outil.
- Les transactions critiques (espace + quota, place + invitation, acceptation + inscription, réservation d'upload, plan effectif) utilisent des transactions interactives Prisma avec verrou explicite sur la ligne du compte professeur.
- Le développement local utilise un PostgreSQL local (Docker ou installation native) ; la CI démarre un service PostgreSQL éphémère.
- Les migrations SQLite existantes (`prisma/migrations`) sont remplacées par une migration de base PostgreSQL générée depuis le schéma actuel ; `dev.db` n'est plus utilisé. Aucune donnée réelle n'existe en SQLite (environnement de dev uniquement) — à reconfirmer dans s21.

## Considered options
- Garder SQLite en dev et PostgreSQL en prod — rejeté : les tests de concurrence et de contraintes ne prouveraient rien sur la base réelle.
- Supabase (Auth + PostgreSQL + Realtime) — rejeté pour le MVP : réécriture de l'auth et de l'accès aux données, région et sous-traitant non confirmés ; voir ADR 011 pour l'autorisation.
- Drizzle ou SQL brut — rejeté : un second accès typé contredit la règle « un seul ORM, un seul système de migrations » du dossier.

## Consequences
- `npm run dev` exige un PostgreSQL démarré : documenter la commande dans le README et `.env.example` (`DATABASE_URL`).
- La CI gagne un service PostgreSQL ; durée de job un peu plus longue.
- Les tests d'intégration peuvent enfin vérifier verrous, FK composites et contraintes partielles.
