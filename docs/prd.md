# PRD — masterguitar (v2)

> Recadrage du 2026-10-29 d'après le dossier produit v2.0 (`Riff-Club-Dossier-Produit`, orientation confirmée par David). Le PRD v1 (alternative à Podia, vente de cours aux élèves) reste dans l'historique git et dans l'archive v1.0 du dossier. Décisions structurantes : ADR 009 à 013.

## Target SaaS
**Discord** (https://discord.com/) comme **référence de structure**, et non comme produit à copier : espaces privés organisés en rubriques, que beaucoup de professeurs de guitare utilisent déjà pour leurs cours, PDF et échanges. Podia (PRD v1) n'est plus la cible.

## Kill mode
**Produit concurrent** vendu aux professeurs de guitare indépendants, par **abonnement logiciel du professeur**. L'élève ne paie rien à la plateforme ; aucune commission, aucune vente de cours encaissée par masterguitar au MVP.

## Why kill it
- Dans Discord, cours, PDF et échanges se perdent dans le flux : l'élève ne retrouve pas toujours sa prochaine étape.
- Le professeur n'a pas de rendu audio contextualisé, ni de moyen de commenter un passage précis.
- La pratique n'est pas reliée à un parcours structuré.
- On ne reprend ni la messagerie généraliste, ni la présence globale, ni les notifications agressives (`@everyone`, compteurs, push), ni la visio et le partage d'écran.

L'ampleur de ce constat chez d'autres professeurs est une **hypothèse à valider** pendant le pilote.

## Problem
Un professeur indépendant veut transformer ses supports (souvent des PDF) en progression claire, recevoir la pratique de ses élèves sous forme d'audio et corriger sans se disperser. Promesse : **« Tes cours structurés, la pratique de tes élèves et tes retours, dans un même espace. »**

## Target users
| Persona | Besoin | Phase |
|---|---|---|
| Professeur indépendant (marché local, bouche-à-oreille) | Transformer ses PDF en parcours, corriger sans se disperser | Cible MVP |
| Élève adulte | Savoir quoi pratiquer, rendre un audio, comprendre un retour précis | MVP |
| Élève mineur et responsable légal | Cadre privé, information adaptée | Prévu dès la conception ; inclusion seulement après protocole validé |
| Exploitant | Isoler les espaces, limiter le stockage, traiter abonnements et incidents | MVP |
| École de musique associative | Plusieurs enseignants et classes | Après MVP |

Un espace de cours appartient au compte professeur ; un élève peut rejoindre plusieurs espaces, y compris de professeurs différents.

## Perimeter — the 20% that matters

### Replicated (core loop)
| Feature | Complexity (1-5) | Why this score |
|---|---|---|
| Compte professeur, espaces de cours privés, invitations bornées par quota | 4 | Places réservées en transaction, invitations hashées, isolation entre espaces |
| Cadre de navigation façon Discord (rail, rubriques, centre, contexte, tiroirs mobiles) | 3 | Rôles prof/élève distincts, accessibilité clavier et mobile |
| Parcours structurés : modules, étapes, ressources, progression minimale | 3 | Brouillon/publication, ordre persistant, archivage sans perte |
| Fils de classe (annonces, questions, commentaires) avec modération simple | 3 | Pagination, signalement, masquage, limité à l'espace |
| Devoir audio privé : capturer ou importer, réécouter, envoyer | 4 | Cycle de vie micro, upload direct borné, validation serveur, idempotence |
| Retour du professeur horodaté à un passage + note privée séparée | 3 | Offsets bornés par la durée réelle, confidentialité stricte |
| Métronome local complet (gratuit) | 2 | Web Audio, planification sur l'horloge audio |
| Métronome partagé piloté par le professeur (payant) | 5 | Temps réel, horloges, révisions et reprise — **gardé car c'est une valeur différenciante**, mais après la boucle devoir audio |
| Lien de visio externe (Jitsi, Meet, Zoom) ouvert volontairement | 1 | URL HTTPS validée, pas d'embed |
| Catalogue de plans versionné + abonnement professeur Stripe + portail | 4 | Webhooks signés, inbox idempotente, plan effectif calculé au serveur |
| Export, suppression, rétention des audios | 3 | Jobs de purge, état visible, restauration testée |

### Explicitly NOT replicated (graveyard)
- Visio hébergée, transport multicam interne, enregistrement des cours en direct
- Vente de cours aux élèves, commission, Stripe Connect, marketplace (code v1 gelé, ADR 009)
- Hébergement et vente de vidéos premium (une URL vidéo peut rester une ressource)
- Tablatures interactives, manche annotable, accordeur, backing tracks (après MVP, P1-A à P1-C)
- Journal de pratique détaillé et analyses par élève (après MVP)
- Domaine personnalisé, écoles multi-enseignants, communauté transversale à la plateforme
- Messagerie privée entre élèves, présence globale, push et sons de notification par défaut
- Streaks, classements, gamification, assistant IA, transcription ou analyse IA de l'audio
- Application native

### The angle (done differently / better)
1. **Structure plutôt que flux** : le parcours est la référence, les rubriques organisent le travail ; on sait quoi faire en revenant après plusieurs jours.
2. **Boucle audio privée** : l'élève rend un enregistrement, le professeur commente un moment précis (« Aller à 00:42 »).
3. **Calme** : pas de pression, pas de compteurs anxiogènes, notifications sobres par e-mail.
4. **Gratuit utile** : la qualité des outils de base ne baisse pas sur le plan gratuit ; seules les capacités (espaces, élèves, devoirs audio, métronome partagé) dépendent du plan.
5. **Identité de studio** noir/brun/cuivre (ADR 013), familière pour qui connaît Discord sans l'exiger.

## Constraints
- **Stack** : Next.js 16 / React 19 / TypeScript, Prisma 7 + PostgreSQL (ADR 010), NextAuth v5 (ADR 011), stockage objet privé S3-compatible (ADR 012), Stripe Billing.
- **Hébergement visé** : Infomaniak (application Node). Régions et sous-traitants de chaque service à confirmer en M0 ; ne pas présenter toute la chaîne comme hébergée chez Infomaniak avant vérification.
- **Équipe** : développeur seul, avec 3 à 5 professeurs testeurs (hypothèse).
- **Plans** : prix, quotas et fonctionnalités viennent du catalogue en base, jamais d'un montant dans un composant. Pistes à tester : limite gratuite de 5 à 10 élèves, paliers vers 20 € et 40 €/mois.
- **Audio** (hypothèses à confirmer en M0) : 120 s, 5 MiB, trois tentatives par devoir, conservation 90 jours.
- **Mineurs** : prévus dans le modèle, mais aucun mineur dans le pilote avant validation du protocole d'information et d'autorisation.
- **Bloquants** : avant données réelles → stockage, région, rétention audio ; avant encaissement → prix, quotas, conditions ; avant mineurs → protocole validé.

## Success criteria
Seuils proposés pour un pilote de 5 professeurs et 20 élèves sur 4 semaines (hypothèses, pas des résultats) :
1. **Première valeur prof** : parcours de 3 étapes créé depuis un PDF préparé, médiane ≤ 20 min sans aide critique.
2. **Première pratique élève** : ≥ 70 % des invitations acceptées mènent à une étape réalisée sous 7 jours.
3. **Boucle de retour** : ≥ 80 % des rendus audio reçoivent au moins un commentaire horodaté sous 7 jours.
4. **Dépôt fiable** : ≥ 95 % des envois finalisés sans perte après réessai (nombres bruts et causes).
5. **Métronome compréhensible** : ≥ 90 % des participants activent, suivent et arrêtent le son sans aide ; écart mesuré séparément, sans promesse de synchronisation parfaite.
6. **Adoption** : ≥ 4 professeurs sur 5 publient un parcours, corrigent 3 rendus et veulent continuer.
7. **Isolation** : aucun accès d'un espace à un autre en changeant un identifiant (tests à deux espaces).
8. **Accessibilité** : parcours critiques au clavier et sur mobile, audit RGAA ciblé sans annoncer de conformité globale.
