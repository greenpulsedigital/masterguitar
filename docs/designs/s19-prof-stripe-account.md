# Design — Story s19-prof-stripe-account

## Screen(s)

### Accès depuis le dashboard (`/dashboard`)

Le dashboard conserve son entrée « Mes cours » et ajoute une Card « Paiements Stripe ». La Card est le point d’entrée principal vers `/dashboard/settings/payments`; elle expose uniquement le statut fonctionnel du raccordement, jamais un email, un nom d’entreprise ou un identifiant Stripe.

**Layout (mobile → desktop)**:

```
┌─────────────────────────────────────┐
│ Tableau de bord                     │
│ Bienvenue, ...                      │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ Paiements Stripe              │   │
│ │ [À configurer]                │   │
│ │ Connectez Stripe pour vendre  │   │
│ │ [Configurer les paiements]    │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ Mes cours                     │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

- Mobile : Cards empilées, `gap-4`, conteneur `p-4`.
- Desktop (`md:`) : grille de Cards, `md:grid-cols-2`, conteneur `p-6`; la Card Stripe garde la même hiérarchie.
- Statuts affichés : `À configurer`, `Connecté`, `Clé à remplacer`, `Déconnexion en cours`.
- Le `Badge` de mode (`TEST` ou `LIVE`) n’est affiché que lorsque le compte est connecté. Le statut « Connecté » peut être un Badge `default`; aucun token de couleur de succès n’est inventé.
- Le lien/bouton « Configurer les paiements » mène toujours à `/dashboard/settings/payments`.

### Réglages des paiements (`/dashboard/settings/payments`)

Page dédiée au prof, avec le même `Header` sticky que le dashboard. Le contenu est volontairement centré et court : le secret ne doit pas devenir un élément persistant de l’interface.

**Layout mobile**:

```
┌─────────────────────────────────────┐
│ MasterGuitar          Tableau de bord│
├─────────────────────────────────────┤
│ Paiements Stripe                    │
│ Configurez le compte qui recevra    │
│ directement les paiements.          │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ Connecter votre compte Stripe │   │
│ │ Clé API restreinte Stripe     │   │
│ │ [••••••••••••••••••••••••••]  │   │
│ │ Exemple de format :           │   │
│ │ rk_test_••••                  │   │
│ │ [permissions minimales]       │   │
│ │ ⚠ Ne collez jamais une clé    │   │
│ │ secrète complète sk_          │   │
│ │ [ Connecter Stripe ]          │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Layout desktop (`md:` et au-delà)**:

- Wrapper `container mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12`.
- `h1` « Paiements Stripe » en `text-3xl font-semibold`, puis une description en `text-muted-foreground`.
- La Card principale occupe la largeur disponible; son contenu reste en une colonne, avec une largeur de formulaire confortable et aucun champ côte à côte.
- Les états de page réutilisent la même Card et le même emplacement de statut afin de ne pas faire sauter le contenu quand le statut change.

#### État non configuré

**Contenu et interaction**:

1. `CardHeader` : « Connecter votre compte Stripe »; description : « Les paiements de vos élèves seront créés directement sur votre compte Stripe. »
2. `Label` : « Clé API restreinte Stripe ».
3. `Input` avec `type="password"`, `name="restrictedKey"`, `autocomplete="off"`, `spellcheck="false"`, et un placeholder de format uniquement : `rk_test_••••`.
4. Texte d’aide : « Utilisez de préférence une clé restreinte. La clé ne sera jamais réaffichée après l’enregistrement. »
5. Bloc d’avertissement en HTML simple, avec `bg-muted`, bordure `border` et texte `text-sm` : « Ne collez jamais une clé secrète complète commençant par `sk_`. Une clé restreinte suffit pour ce parcours. » Aucun composant `Alert` n’est introduit.
6. Section de permissions, sous le titre « Permissions minimales à accorder » :
   - « Lire le compte Stripe » (`connected_account_read`, confirmé).
   - « Créer une session de paiement » (`checkout_session_write`, confirmé).
   - « Créer et gérer l’endpoint webhook » (`webhook_write`, confirmé pour l’écriture).
   Le texte de la page reste compréhensible sans les identifiants techniques : « Ces permissions permettent de vérifier le compte, de créer les paiements et de recevoir leur confirmation. »
7. `Button variant="default"` : « Connecter Stripe », pleine largeur sur mobile et `w-fit` sur desktop.

Le mode n’est pas choisi dans un `Select` : il est déduit du préfixe de la clé (`rk_test_` ou `rk_live_`) et enregistré avec le compte. La page peut afficher une indication non éditable après détection : « Mode détecté : TEST » ou « Mode détecté : LIVE ». Une clé de test est refusée en production avant stockage; le message visible reste le même message générique de clé refusée.

#### État connecté

- `CardHeader` : « Compte Stripe connecté ».
- Ligne de statut : `Badge` « Connecté » + `Badge` « TEST » ou « LIVE ».
- Résumé minimal : « Clé enregistrée · se termine par ••••A7Q2 ». La valeur `A7Q2` dans la maquette est fictive; l’implémentation affiche uniquement les quatre derniers caractères stockés, jamais le secret complet.
- Texte : « Aucune donnée personnelle de votre compte Stripe n’est affichée ici. »
- Action `Button variant="destructive"`, minimum `min-h-11` : « Déconnecter ».
- Le bouton ouvre le dialog de confirmation décrit plus bas; il ne déconnecte jamais directement au premier clic.

#### État clé invalide

- `CardHeader` : « Remplacer la clé Stripe ».
- Bloc inline `role="alert"`, `aria-live="assertive"` : « Impossible de valider cette clé Stripe. Vérifiez la clé et réessayez. »
- Le même texte est utilisé pour une clé invalide, expirée, insuffisamment autorisée ou limitée; aucun code, message Stripe, identifiant de compte ou détail de permission refusée n’est exposé.
- L’action « Remplacer la clé » remet le champ `password` à vide et place le focus sur son `Label`/`Input`. La clé précédente ne doit pas être préremplie.

#### Déconnexion en cours

- `CardHeader` : « Déconnexion en cours » et `Badge` secondaire « En cours ».
- Message dans une structure HTML simple avec `aria-live="polite"` : « Les nouveaux paiements et les nouvelles publications sont désactivés pendant la déconnexion. L’endpoint webhook est supprimé au mieux. La clé reste chiffrée pendant la fenêtre de réconciliation documentée, puis elle est supprimée. »
- Toutes les actions de la Card sont désactivées; aucun bouton « Annuler » n’est ajouté tant que ce comportement n’est pas défini.
- Le statut revient à « Non configuré » après suppression effective; en cas d’échec de réconciliation, l’interface ne montre pas de détail Stripe et conserve un état récupérable à définir dans le plan.

#### Chargement et erreurs

- **Chargement initial** : Card avec `aria-busy="true"`, titre « Chargement des paiements Stripe » et texte « Vérification de la configuration… ». Les contrôles sont absents ou désactivés; aucun composant `Skeleton` n’est utilisé puisqu’il n’est pas dans l’inventaire utilisable de cette story.
- **Erreur générique** : bloc inline `role="alert"`, `aria-live="assertive"` : « Impossible de charger l’état Stripe. Réessayez plus tard. » Action `Button variant="outline"` : « Réessayer ».
- **Limitation de débit** : même structure, texte : « Trop de tentatives. Réessayez dans quelques instants. » Aucun délai exact, compteur ou détail par IP n’est révélé.
- **Échec de connexion** : le message est celui de l’état clé invalide, quelle que soit la cause Stripe refusée. Le bouton redevient actif pour autoriser une nouvelle tentative.

### Dialog de confirmation de déconnexion

Déclenché par « Déconnecter » dans l’état connecté. Il suit le pattern déjà utilisé dans `module-list.tsx` et `course/[id]/page.tsx` (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`).

**Mobile → desktop**:

- Mobile : `DialogContent` pleine largeur moins `2rem`, contenu empilé; les actions sont empilées dans l’ordre « Annuler » puis « Déconnecter » via le footer de la primitive.
- Desktop : largeur native de la primitive (`sm:max-w-sm`); les actions sont alignées à droite.
- Titre : « Déconnecter le compte Stripe ? »
- Description : « Les nouveaux paiements et les nouvelles publications seront bloqués. L’endpoint webhook sera supprimé au mieux. Les paiements déjà confirmés et l’accès des élèves ne sont pas supprimés. La clé sera supprimée après la fenêtre de réconciliation. »
- Actions : `Button variant="outline"` « Annuler » et `Button variant="destructive"` « Déconnecter ».
- À la confirmation : fermeture du dialog, passage immédiat à l’état « Déconnexion en cours », désactivation des nouvelles publications et checkouts côté serveur. Le focus revient au bouton déclencheur si l’action échoue.

### Blocage de publication (`/dashboard/courses/[id]`)

Sur la page d’édition existante, le bouton « Publier » reste proche du titre et du Badge de statut. Si aucun compte Stripe `ACTIVE` n’est disponible, le serveur refuse la mutation et l’interface explique le blocage avant le formulaire du cours.

**Mobile**:

```
Modifier le cours       [DRAFT]

[ Publication indisponible : connectez un compte Stripe actif
  pour permettre l’achat de ce cours.
  Configurer les paiements ]

[Publier désactivé] [Supprimer]
```

- Bloc HTML inline avec `role="alert"`, fond `destructive/10`, texte `text-destructive`, `px-4 py-3`, rayon `--radius-sm`.
- Message : « Publication indisponible : connectez un compte Stripe actif pour permettre l’achat de ce cours. »
- Lien textuel accessible vers `/dashboard/settings/payments` : « Configurer les paiements ».
- Pour un cours `DRAFT`, le bouton « Publier » est désactivé visuellement et l’action serveur reste l’autorité. Pour un cours déjà `PUBLISHED`, ne pas inventer de repassage automatique en brouillon; le checkout revalide l’état du compte et la page reste visible mais non achetable.

### Checkout élève indisponible (`/checkout/[courseId]`)

Quand le prof n’a pas de compte Stripe `ACTIVE`, la page de checkout ne crée aucune session Stripe et n’expose aucune cause technique.

- Wrapper identique à s07 : `container mx-auto max-w-2xl px-4 py-12`.
- Une Card avec titre « Vente indisponible ».
- Message `text-lg` : « La vente de ce cours est indisponible pour le moment. Réessayez plus tard. »
- Action `Button`/lien vers la page du cours : « Retour au cours ».
- Aucun email, nom d’entreprise, préfixe de clé, statut interne, `profId` ou message Stripe n’est rendu côté élève.

## Flux et comportements transverses

| Situation | État visible | Action autorisée |
|-----------|--------------|------------------|
| Aucun compte | `À configurer` / formulaire | Saisir une clé et connecter |
| Clé refusée | `Clé à remplacer` | Remplacer la clé, sans détail de cause |
| Compte valide | `Connecté` + `TEST`/`LIVE` + quatre derniers caractères | Ouvrir la confirmation de déconnexion |
| Déconnexion lancée | `Déconnexion en cours` | Aucune action concurrente |
| Rate limit | Erreur générique dédiée | Réessayer plus tard |
| Prof sans compte `ACTIVE` | Publication bloquée; checkout indisponible | Lien de configuration côté prof; message neutre côté élève |

Les actions de connexion et déconnexion sont limitées côté serveur par utilisateur et adresse IP et vérifient le rôle `PROF` en base. Ces garanties ne sont pas remplacées par l’interface et aucun secret ne passe dans l’URL, les props, les cookies, les logs ou le résultat d’une Server Action.

---

## Mockup

`docs/designs/s19-prof-stripe-account.html` — référence visuelle statique des écrans mobiles et desktop. Les valeurs `rk_test_••••` et `••••A7Q2` sont des exemples fictifs, uniquement destinés à la maquette. DO NOT copy into production: l’implémentation doit utiliser les vrais composants du dépôt.

La maquette montre l’accès dashboard, la page de réglages en états non configuré/connecté, les variantes clé invalide/déconnexion/erreur, le dialog de confirmation, le blocage de publication et le checkout élève indisponible.

---

## Reused components (from the design system)

| Component | Where | Why |
|-----------|-------|-----|
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | Dashboard, réglages, checkout élève | Conteneurs et hiérarchie des blocs sans nouveau composant |
| `Badge` | Statut dashboard, statut connecté, mode `TEST`/`LIVE` | Statut compact et mode clairement visible |
| `Input` | Saisie de la clé restreinte | Champ contrôlé, `type="password"`, jamais réaffiché |
| `Label` | Champ de clé | Libellé explicite associé par `htmlFor` |
| `Button` | Connexion, déconnexion, retry, navigation | Actions cohérentes; `min-h-11` local pour atteindre 44 px |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` | Confirmation de déconnexion | Focus trap, fermeture Escape et confirmation structurée |

Les liens de navigation sont des liens natifs/Next `Link` éventuellement rendus avec `buttonVariants`, comme dans le dashboard existant. Les messages d’erreur et d’avertissement restent des structures HTML inline avec les tokens existants : aucun `Alert`, `Toast`, `Select` ou autre primitive non installée n’est inventé.

---

## Tokens et responsive

- **Couleurs** : `--background` pour la page, `--card`/`--card-foreground` pour les Cards, `--foreground` pour le texte principal, `--muted`/`--muted-foreground` pour l’aide et les états secondaires, `--primary`/`--primary-foreground` pour l’action de connexion et les liens, `--accent`/`--accent-foreground` pour les mises en évidence, `--destructive` pour les erreurs et la déconnexion, `--ring` pour le focus.
- **Typographie** : `text-3xl font-semibold` pour le titre de page, `text-xl`/`font-semibold` pour les titres de Card, `text-base` pour les descriptions, `text-sm` pour les aides et messages, `text-xs` uniquement pour les libellés secondaires de statut.
- **Espacement** : wrapper `px-4 py-8 md:px-6 md:py-12`, Card `p-4` mobile et `p-6` desktop selon la primitive, `gap-4` entre champs, `gap-6` entre sections, `gap-8` pour les groupes desktop.
- **Rayons** : rayon de Card/Dialog selon les primitives (`--radius-lg`), rayon d’Input/Badge selon `--radius-sm`, rayon de Button selon `--radius-md`.
- **Responsive** : conception à 375 px; une colonne sur mobile, grille dashboard en `md:grid-cols-2` à 768 px; aucun changement structurel nécessaire à `lg:`. Les actions longues passent en pleine largeur sur mobile puis en largeur automatique sur desktop.
- **Cible tactile** : tous les boutons et liens d’action de cette story visent `min-h-11` (44 px) et un padding horizontal issu de l’échelle Tailwind. La primitive `Button size="lg"` actuelle ne fait que 36 px; le correctif est local à cette story.

---

## Accessibility

- Utiliser un `h1` pour le titre de chaque page, puis des titres de section et Card dans l’ordre. La primitive actuelle `CardTitle` rend un `div`; conserver la primitive sans inventer une variante, mais fournir une structure de titres native autour si nécessaire.
- Associer `Label` et `Input` avec `htmlFor`/`id`; le champ est `type="password"`, `autocomplete="off"`, sans bouton d’affichage de secret et sans valeur par défaut après enregistrement.
- Le message de clé refusée et les erreurs de chargement/rate limit utilisent `role="alert"` et `aria-live="assertive"`. L’état de déconnexion utilise `aria-live="polite"`; le conteneur de chargement expose `aria-busy="true"`.
- Les erreurs ne reposent jamais sur la couleur seule : le texte est présent et générique. Le focus visible utilise `--ring` via les primitives.
- Le dialog utilise le focus management de `Dialog`: focus initial sur l’action « Annuler » ou le titre selon la primitive, focus contenu dans le dialog, fermeture par Escape, retour du focus au bouton « Déconnecter » après fermeture.
- L’ordre de tabulation suit l’ordre visuel : navigation, champ, aides non interactives, action principale, puis action destructive. Les liens ont un intitulé explicite et une destination réelle.
- Les badges « TEST » et « LIVE » doivent être accompagnés du mot visible « Mode » dans le texte ou le contexte; la couleur n’est pas le seul signal.
- Les états désactivés ne doivent pas supprimer l’explication accessible. Pendant la déconnexion, le message est annoncé et les actions concurrentes portent `disabled`.
- Le contenu ne déborde pas à 375 px; les textes longs et les clés masquées peuvent revenir à la ligne (`overflow-wrap:anywhere` dans la référence). Aucun secret n’est sélectionnable ou affiché en clair.

---

## States

### Dashboard

- `À configurer` : Badge secondaire, texte d’invitation, lien de réglages.
- `Connecté` : Badge de statut + Badge `TEST`/`LIVE`, quatre derniers caractères, lien de gestion.
- `Clé à remplacer` : statut d’action requise, lien de réglages; aucun détail de refus.
- `Déconnexion en cours` : Badge secondaire, texte court, lien désactivé ou absent.

### Réglages

- `Non configuré` : formulaire et permissions minimales.
- `Connecté` : mode, quatre derniers caractères, déconnexion via dialog.
- `Clé invalide` : message générique commun à toutes les clés refusées, remplacement à vide.
- `Déconnexion en cours` : publication et checkout désactivés immédiatement, suppression de l’endpoint au mieux, réconciliation chiffrée puis suppression.
- `Chargement` : `aria-busy`, aucun contrôle actif avant résolution.
- `Erreur générique` : message et « Réessayer ».
- `Rate limit` : message dédié sans compteur ni détail d’infrastructure.

### Publication et checkout

- `Publication bloquée` : message prof avec lien vers les réglages; l’autorité reste la vérification atomique de `toggleCourseStatus`.
- `Vente indisponible` : message élève neutre et retour au cours; aucun appel Stripe côté checkout.

## Design system gaps

- Aucun composant `Alert`/`Toast`/`Select` n’est utilisable dans l’inventaire demandé. Les avertissements et erreurs sont donc des structures HTML inline avec `role`, `aria-live`, bordure, fond `--muted` ou `--destructive/10` et texte tokenisé.
- Aucun composant `Skeleton` n’est retenu pour le chargement de cette story; le design utilise une Card textuelle avec `aria-busy`.
- Il n’existe pas de token de couleur de succès dans le système. L’état connecté est rendu par le texte et un `Badge` existant, sans inventer de vert.

## Écarts connus / à décider

- **Alerte manquante** : décider plus tard si une primitive d’alerte/notification doit rejoindre le design system. Cette story ne la crée pas.
- **`Button size="lg"` à 36 px** : la primitive actuelle rend `h-9`; les actions de s19 doivent forcer localement `min-h-11` pour atteindre 44 px, sans modifier la primitive dans cette story.
- **`CardTitle` non sémantique** : la primitive rend un `div`. La hiérarchie accessible doit être complétée par des titres HTML natifs autour des Cards; la correction globale relève d’une autre décision.
- **Lecture/suppression d’endpoint avec clé restreinte** : non établies par la recherche. La maquette n’affirme pas que ces opérations sont disponibles; le plan doit décider le comportement de réconciliation et le message générique si Stripe refuse ces appels.
- **Fenêtre de réconciliation** : sa durée et le traitement d’un échec de suppression côté Stripe restent à documenter. Le design explique la conservation chiffrée temporaire sans afficher de durée inventée.
- **Mode test en production** : la recherche propose de le refuser; la validation exacte de l’environnement et le wording opérationnel doivent être figés dans le plan.
- **Statut du dashboard et navigation** : le dashboard actuel ne possède qu’une Card « Mes cours »; la Card Stripe et sa lecture de statut sont à ajouter pendant l’exécution de la story.
