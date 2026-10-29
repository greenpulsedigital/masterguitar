# ADR 013 — Thème sombre noir/brun/cuivre pour l'application v2

- Status: accepted
- Date: 2026-10-29
- Scope: framing
- Supersedes: ADR 007 (thème clair unique « Bois & Ambre »)

## Context
ADR 007 a remplacé le thème sombre initial par un thème clair « Bois & Ambre ». Le dossier v2 (brief UI/UX §3, PRD §1) marque comme **décidée** par David une identité noire/brune/cuivre, avec une composition proche de Discord (rail d'espaces, navigation par rubriques, travail central, contexte repliable), et fournit des tokens sémantiques (`#100e0c` fond, `#f1e8dc` texte, `#cb915d` accent, etc.), les polices Barlow Condensed et DM Sans, servies localement.

## Decision
- L'application v2 (espaces de cours) et le site public adoptent **un thème sombre unique** noir/brun/cuivre, construit à partir des tokens du brief v2. Pas de bascule clair/sombre au MVP.
- Les tokens sont sémantiques (`background.canvas`, `text.primary`, `accent.primary`…) et remplacent ceux de « Bois & Ambre » dans `src/app/globals.css` ; contrastes mesurés (texte ≥ 4,5:1, grands textes et focus ≥ 3:1), texte charbon sur bouton cuivre.
- Polices en WOFF2 locales (licences conservées), aucun chargement externe obligatoire.
- `docs/design-system.md` doit être réécrit (`/ks-design-system`) **avant** la story du cadre Discord (s24) ; aucun écran v2 n'est conçu sur l'ancien système.

## Considered options
- Garder « Bois & Ambre » clair — rejeté : contredit la décision explicite du dossier v2.
- Proposer les deux thèmes — rejeté : double la recette visuelle et d'accessibilité pour un développeur seul.

## Consequences
- Les écrans gelés de v1 (vente, paiements) basculent visuellement sans être retravaillés ; acceptable puisqu'ils ne font plus partie du parcours.
- La règle « Light only » de `AGENTS.md` / `CLAUDE.md` est à mettre à jour dans la même PR que le design system.
