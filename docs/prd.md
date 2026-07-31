# PRD — MasterGuitar

## Target SaaS
**Podia** (https://www.podia.com/) — plateforme de vente de cours en ligne, formations et communautés.

## Kill mode
**Produit concurrent** — on vend la plateforme à des profs de guitare indépendants. Scope : fonctionnalités complètes pour un marché vertical (musiciens), pas un outil interne.

## Why kill it
- **Commission trop élevée** — Podia prend une part des revenus, cet argent doit rester chez les artistes
- **Design générique** — pas pensé pour les musiciens, pas d'outils spécifiques instrument
- **Pas d'identité** — les pages de vente se ressemblent toutes

## Problem
Les profs de guitare indépendants veulent monétiser leur expertise en ligne mais les plateformes existantes prennent des commissions importantes et offrent une expérience générique. Ils ont besoin d'une plateforme premium, pensée pour les musiciens, où ils gardent 100% de leurs revenus.

## Target users
**Profs de guitare indépendants** avec une audience existante (YouTube, Instagram, TikTok). Ils ont déjà du contenu ou savent en créer, cherchent un outil pour vendre — pas pour se faire connaître.

## Perimeter — the 20% that matters

### Replicated (core loop)
| Feature | Complexity | Why this score |
|---------|------------|----------------|
| Cours vidéo (modules, chapitres) | 2 | CRUD + organisation hiérarchique, upload vidéo externe |
| Page de vente du cours | 2 | Landing page builder basique, templates |
| Espace membre | 3 | Auth, gestion accès, progression, contenu gated |
| Dashboard prof | 2 | Stats basiques, liste des ventes, revenus |
| Paiement (one-shot + abonnement) | 4 | Intégration Stripe, webhooks, gestion des abos |
| Communauté / forum | 3 | Discussions, modération basique, notifications |
| Affiliation | 3 | Tracking liens, calcul commissions, dashboard affilié |
| Bundles / upsells | 3 | Logique de pricing, combinaisons de produits |

### Explicitly NOT replicated (graveyard)
- **Webinaires live** — les profs utilisent Zoom/YouTube Live, pas besoin de réinventer
- **Multi-devises / TVA automatique** — compliance fiscale = projet à part entière, le prof gère sa compta
- **Coaching 1:1 / prise de RDV** — Calendly existe, pas de valeur à intégrer
- **Email marketing intégré** — Mailchimp/ConvertKit font ça mieux, on intègre via webhook

### The angle (done differently / better)
1. **Commission 0%** — abonnement mensuel fixe pour le prof, il garde 100% des ventes (moins Stripe ~2.9%)
2. **Design premium "studio"** — visuels, ambiance pensée pour musiciens, pas un template SaaS générique
3. **Mobile-first** — l'expérience élève est conçue pour le téléphone (apprendre avec la guitare sur les genoux)
4. **Outils spécifiques guitare** — tablatures intégrées, ralenti vidéo, boucles de sections

## Constraints
- **Stack** : Next.js + React
- **Équipe** : solo developer
- **Hébergement vidéo** : externe (Bunny, Mux, ou similaire) — pas de streaming maison

## Success criteria
1. Un prof peut créer un cours vidéo (modules/chapitres) et le mettre en vente en **moins de 30 minutes**
2. Un élève peut acheter (one-shot ou abo) et accéder **immédiatement** à son espace
3. Le prof touche **100% du paiement** (moins frais Stripe ~2.9%)
4. Les outils guitare fonctionnent : **tablatures, ralenti vidéo, boucles**
5. Le design est perçu comme **premium vs Podia** (test utilisateur qualitatif)
6. **Mobile-first** : l'expérience élève est fluide sur téléphone
