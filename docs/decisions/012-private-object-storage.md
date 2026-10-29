# ADR 012 — Stockage objet privé compatible S3 pour ressources et rendus audio

- Status: accepted (fournisseur à qualifier)
- Date: 2026-10-29
- Scope: framing

## Context
Le MVP v2 stocke deux familles de fichiers privés : les ressources d'étape (PDF, images) et les rendus audio des élèves (devoirs). Le dossier impose : transfert direct borné après autorisation serveur, clé d'objet opaque, aucune URL signée persistée, lecture par URL courte (5 min) avec requêtes Range, validation serveur du type/durée/taille, purge à l'échéance de rétention et sauvegarde incluant l'inventaire d'objets. L'application vise Infomaniak.

## Decision
- **Stockage objet privé compatible S3** (URL présignées PUT/GET), accédé uniquement par un adaptateur `src/server/providers/storage.ts`. Aucune autre partie du code ne connaît le fournisseur.
- Candidat principal : stockage objet d'Infomaniak (Public Cloud), à qualifier en M0 : compatibilité des URL présignées, Range, CORS, région, coût, sauvegarde. En développement et en CI : un serveur compatible S3 local (MinIO ou équivalent) ou un adaptateur en mémoire pour les tests.
- Les octets ne transitent pas par le serveur Next.js à l'envoi ; la finalisation relit l'objet (taille réelle, type réel, durée) côté serveur.
- Les clés et secrets de stockage sont des variables serveur ; jamais `NEXT_PUBLIC_*`.

## Considered options
- Stockage disque sur l'hébergement Node — rejeté : pas d'URL présignée, sauvegarde et purge à la main, couplage au serveur.
- Supabase Storage — rejeté avec ADR 010.
- Stocker l'audio en base — rejeté : volume, sauvegardes et lecture Range inadaptés.

## Consequences
- La qualification du fournisseur bloque l'envoi de **données réelles** (M3), pas le développement : l'adaptateur et les tests avancent avec le stockage local.
- La sauvegarde doit couvrir base + objets ; un dump de base seul ne suffit pas (exercice de restauration en M6).
