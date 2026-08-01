# ADR 005 — Hébergement vidéo

- Status: accepted
- Date: 2026-07-31
- Scope: framing

## Context

MasterGuitar est une plateforme de cours vidéo. L'hébergement, le transcodage et le streaming vidéo sont des problèmes complexes (formats, résolutions, CDN, DRM).

Le PRD impose : "Hébergement vidéo externe — pas de streaming maison."

## Decision

**Vidéo externe** : le prof fournit une URL (YouTube, Vimeo, Bunny Stream, Mux, etc.), la plateforme l'embed.

Pour le MVP :
- Champ `videoUrl` sur `Lesson`
- Embed via `<iframe>` ou player custom wrapper
- Support YouTube, Vimeo, Bunny Stream URLs
- Pas de validation du format — si l'URL marche, c'est bon

## Considered options

- **Embed externe** — retenu. Zéro infrastructure, le prof choisit son hébergeur, on se concentre sur la valeur (outils guitare, UX).
- Self-hosted (S3 + CloudFront) — rejeté. Coûts CDN, transcodage, maintenance, hors scope.
- Mux/Bunny API integration — rejeté pour MVP. Ajouter upload direct est un nice-to-have, pas core.

## Consequences

- Le prof doit avoir un compte YouTube/Vimeo/Bunny/Mux et uploader ses vidéos là-bas.
- Les fonctionnalités avancées (ralenti, boucle A-B) dépendent du player. Pour YouTube, on utilisera l'API YouTube IFrame. Pour les autres, le player HTML5 natif.
- Pas de DRM/protection : si le prof veut protéger ses vidéos, il utilise les options de son hébergeur (unlisted, signed URLs).
- Future scope : intégration directe avec Bunny/Mux pour upload depuis le dashboard.
