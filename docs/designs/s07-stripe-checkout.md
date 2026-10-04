# Design — Story s07-stripe-checkout

## Screen(s)

### Checkout (`/checkout/[courseId]`)

Page de finalisation du paiement pour un cours publié et payant. Le paiement est ensuite effectué sur la page hébergée par Stripe : aucun formulaire de carte bancaire n'est affiché dans MasterGuitar.

**Layout (mobile → desktop)**:
```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Finaliser votre achat       │    │
│  │                             │    │
│  │ Nom du cours                │    │
│  │ 50,00 €                     │    │
│  │                             │    │
│  │ [ Procéder au paiement ]    │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

**Desktop (`md:` et au-delà)**:
- Même contenu, centré dans un conteneur `max-w-2xl`.
- Le conteneur garde `px-4` et `py-12`; aucune sidebar, barre sticky ou navigation supplémentaire n'est ajoutée.
- La Card occupe la largeur disponible du conteneur sans dépasser la largeur définie par `max-w-2xl`.

#### Structure et contenu

1. **Conteneur de page**
   - Wrapper centré avec `container mx-auto max-w-2xl py-12 px-4`.
   - Fond de page `--background`.
   - Le contenu est une seule Card, avec un empilement vertical.

2. **Résumé d'achat**
   - `CardHeader` contient le `CardTitle` : « Finaliser votre achat ».
   - `CardContent` utilise un espacement vertical `space-y-6`.
   - Le titre du cours est rendu dans un `h2`, en `text-2xl font-bold`, avec le texte réel fourni par le cours.
   - Le prix est rendu en euros au format français, par exemple « 50,00 € », en `text-3xl font-bold text-primary`.
   - Aucun sous-total, champ de carte, badge ou résumé supplémentaire n'est ajouté : Stripe prend en charge l'étape de paiement.

3. **Action de paiement**
   - `CheckoutButton` utilise le composant `Button`, `size="lg"`, pleine largeur (`w-full`) et la variante par défaut (`default`).
   - Libellé normal : « Procéder au paiement ».
   - Au clic, le bouton appelle l'action serveur puis redirige vers l'URL Stripe retournée.
   - La cible tactile visée est au minimum de 44 × 44 px. Le design réutilise `size="lg"`; comme la primitive actuelle rend `h-9` (36 px), le bouton de cette story force localement `h-11`.

#### États

- **Normal** : Card affichant le titre « Finaliser votre achat », le titre du cours, le prix et « Procéder au paiement ».
- **Chargement de l'action** : le libellé devient « Redirection... » et le Button est désactivé jusqu'à la réponse de l'action. Aucun spinner n'est ajouté : le code actuel utilise le changement de libellé comme feedback.
- **Erreur inline** : l'erreur est affichée au-dessus du bouton, dans une zone utilisant `bg-destructive/10 text-destructive px-4 py-3 rounded`. Le texte est conservé tel que renvoyé par l'action, par exemple « Vous devez être connecté pour effectuer un achat », « Cours introuvable », « Ce cours n'est pas disponible à l'achat », « Vous ne pouvez pas acheter votre propre cours », « Vous possédez déjà ce cours » ou « Erreur lors de la création de la session de paiement ». Le bouton redevient actif pour permettre une nouvelle tentative.
- **Vide / données invalides** : aucun état vide custom n'est rendu. Un cours inconnu, non publié ou gratuit appelle `notFound()` et utilise la page 404 standard de Next.js.

### Confirmation de paiement (`/checkout/success?session_id=...`)

Page de confirmation après le retour de Stripe. Elle vérifie la session Stripe et l'identité de l'acheteur avant de rendre une Card. Le layout est identique aux autres écrans de confirmation.

**Layout (mobile → desktop)**:
```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Merci pour votre achat !    │    │
│  │                             │    │
│  │ Votre paiement pour        │    │
│  │ « Nom du cours » ...       │    │
│  │                             │    │
│  │ [ Retour à l'accueil ]     │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

**Desktop (`md:` et au-delà)**:
- Card centrée dans le même `max-w-2xl` que le checkout.
- Le contenu reste en une colonne; le bouton ne devient pas une sidebar ou une action sticky.

#### Variante : paiement confirmé

- `CardHeader` + `CardTitle` : « Merci pour votre achat ! ».
- `CardContent` utilise `space-y-6`.
- Le paragraphe est en `text-lg` et contient le titre du cours quand la session Stripe fournit un `courseId` résolvable : « Votre paiement pour « Guitare Débutant » a été traité avec succès. Vous avez maintenant accès à votre cours. ».
- Si le cours ne peut pas être résolu, le texte de repli est : « Votre paiement a été traité avec succès. Vous avez maintenant accès à votre cours. ».
- Le lien d'action est un `Button` rendu avec un `Link`, libellé « Retour à l'accueil », destination `/`. Il est placé dans un conteneur `flex gap-4`.

#### Variante : paiement en attente

- Rendue quand `session.payment_status` n'est pas `paid`.
- `CardTitle` : « Paiement en attente ».
- `CardContent` contient le texte `text-lg` : si le cours est disponible, « Votre paiement pour « Guitare Débutant » n'est pas encore confirmé. L'accès au cours sera activé dès sa validation. »; sinon, « Votre paiement n'est pas encore confirmé. L'accès au cours sera activé dès sa validation. ».
- `Button` + `Link` : « Retour à l'accueil », destination `/`.
- Le titre du cours est affiché quand la session contient un `courseId` résolvable.

#### Variante : cours déjà acheté (`already_purchased=true`)

- Rendue directement lorsque le paramètre `already_purchased=true` est présent; aucune session Stripe n'est récupérée.
- `CardTitle` : « Cours déjà acheté ».
- `CardContent` contient le texte `text-lg` : « Vous possédez déjà ce cours. ».
- `Button` + `Link` : « Retour à l'accueil », destination `/`.
- Aucun titre de cours n'est disponible dans cette URL, donc aucun titre n'est inventé dans la maquette.

#### États sans écran de confirmation

- Paramètre `session_id` absent et `already_purchased` absent : redirection vers `/`.
- Session Stripe introuvable, erreur de récupération ou session appartenant à un autre utilisateur : redirection vers `/`.
- Utilisateur non connecté avec un `session_id` : redirection vers `/login?callbackUrl=/checkout/success?session_id=...`.

### Flux sans écran dédié

Ces cas sont des redirections ou des réponses de routage; ils ne doivent pas être transformés en nouvelles pages dans cette story.

| Cas | Comportement actuel | Écran rendu |
|-----|---------------------|-------------|
| Annulation sur Stripe | Stripe suit `cancel_url` vers `/cours/[slug]` | Page de vente existante |
| Utilisateur non connecté au checkout | Redirection vers `/login?callbackUrl=/checkout/[courseId]` | Page de connexion existante |
| Prof qui tente d'acheter son propre cours | Redirection vers `/cours/[slug]` | Page de vente existante |
| Cours gratuit | `notFound()` | 404 standard Next.js |
| Cours inconnu ou non publié | `notFound()` | 404 standard Next.js |
| Succès sans session vérifiable | Redirection vers `/` | Accueil existant |

---

## Mockup

`docs/designs/s07-stripe-checkout.html` — référence visuelle statique des écrans et variantes ci-dessus. DO NOT copy into production: Execute builds with the real components.

La maquette présente le checkout en mobile et desktop, puis les trois variantes de la Card de succès. Les redirections sont représentées comme des flux sans écran afin de ne pas suggérer une interface qui n'existe pas dans le code.

---

## Reused components (from the design system)

| Component | Where | Why |
|-----------|-------|-----|
| `Card` | Checkout, succès confirmé, paiement en attente, déjà acheté | Conteneur principal des écrans de paiement |
| `CardHeader` | En-tête de chaque Card | Regroupe le titre de l'écran |
| `CardTitle` | Titres des quatre rendus visibles | Hiérarchie principale et intitulé de l'état |
| `CardContent` | Résumé d'achat, messages et actions | Zone de contenu avec espacement cohérent |
| `Button` | Procéder au paiement, retour à l'accueil | Actions primaires avec tailles tactiles adaptées |
| `Link` rendu par `Button` | Retour vers `/` | Conserve une navigation native et partage le style Button |

Le message d'erreur du `CheckoutButton` reste une structure HTML inline avec les tokens `destructive`; aucun composant `Alert` ou autre composant non présent dans le design system n'est inventé.

---

## Tokens et responsive

- **Couleurs** : `--background` pour le fond de page, `--card` et `--card-foreground` pour les Cards, `--foreground` pour les textes, `--primary` pour le prix et l'action principale, `--primary-foreground` pour le texte du Button, `--destructive` pour l'erreur, `--ring` pour le focus.
- **Typographie** : `text-2xl font-bold` pour le titre du cours du checkout, `text-3xl font-bold` pour le prix, `text-lg` pour les messages de succès et `font-semibold` via `CardTitle` selon le composant réel.
- **Espacement** : `px-4 py-12` sur le wrapper, `space-y-6` dans le contenu, `gap-4` autour de l'action de succès; le padding de Card reste celui du composant (`p-4` mobile, `p-6` desktop) lorsqu'il est appliqué par la primitive.
- **Rayon** : rayon de Card/Button issu de `--radius` et des variantes existantes (`--radius-md` pour les boutons, `--radius-lg` pour les grandes Cards si la primitive l'emploie).
- **Responsive** : mobile-first à 375 px; passage desktop à `md:` (768 px) pour le centrage et l'espace disponible. Aucun changement de structure n'est nécessaire à `lg:`.

## Accessibility

- Ne pas ajouter de nouvelle structure de page : le code actuel rend le titre de l'état via `CardTitle` et le titre du cours via un `h2`. La primitive `CardTitle` actuelle est un `div`; elle ne doit pas être remplacée ici par un composant ou un token inventé. Une sémantique de titre native reste préférable si la primitive est ultérieurement corrigée.
- Le `Button` de paiement doit rester un vrai bouton clavier, avec son nom accessible « Procéder au paiement » ou « Redirection... » lorsqu'il est désactivé.
- Pendant le chargement, le bouton est désactivé et le changement de libellé informe les lecteurs d'écran; le bouton expose `aria-busy="true"`, puis revient à `false` à la fin de l'action.
- La zone d'erreur doit exposer `role="alert"` et être annoncée sans dépendre de la couleur seule. Le texte `text-destructive` doit rester lisible sur son fond `destructive/10`.
- Les liens rendus par `Button` gardent une destination accessible et un libellé explicite; aucun bouton icon-only n'est utilisé.
- Tous les contrôles interactifs doivent viser une cible minimale de 44 × 44 px, un état de focus visible avec `--ring`, et un ordre de tabulation correspondant à l'ordre visuel. Le Button `size="lg"` de la primitive reste en `h-9`, mais les boutons de s07 forcent `h-11` localement.
- Le contenu est lisible à 375 px sans défilement horizontal. Les titres de cours longs peuvent revenir à la ligne; ils ne sont pas tronqués.

---

## States

### Checkout

- **Normal** : cours publié, payant, non acheté; résumé et Button visibles.
- **Loading** : « Redirection... », Button désactivé; pas de spinner supplémentaire.
- **Error** : message inline au-dessus du Button, puis Button réactivé.
- **Empty / invalid** : pas de Card vide; cours absent, brouillon ou gratuit → 404 standard.

### Success

- **Paid** : « Merci pour votre achat ! », message incluant le titre du cours si disponible, retour à l'accueil.
- **Pending** : « Paiement en attente », message d'attente, retour à l'accueil.
- **Already purchased** : « Cours déjà acheté », « Vous possédez déjà ce cours. », retour à l'accueil.
- **Invalid / missing session** : aucune Card de fallback; redirection vers `/` ou `/login` selon le cas.

## Design system gaps

Les besoins visuels sont couverts par `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Button`, les tokens de couleur/typographie/espacement et les primitives HTML existantes. Le design n'ajoute ni composant, ni token, ni écran de redirection. L'attribut `role="alert"` décrit l'accessibilité attendue du message d'erreur; ce n'est pas un nouveau composant.

Deux écarts du socle actuel sont à traiter séparément si l'accessibilité doit être conforme au design system :

- `CardTitle` est implémenté comme un `div` sans rôle de titre; la story conserve cette primitive et ne fabrique pas de composant de remplacement.
- `Button size="lg"` est implémenté en `h-9` (36 px), alors que la règle mobile-first demande une cible tactile de 44 × 44 px; la primitive reste inchangée et les boutons de s07 forcent `h-11` localement.

## Écarts connus entre le code et le design idéal

- `CardTitle` est implémenté comme un `div` sans rôle de titre; la story conserve cette primitive et ne fabrique pas de composant de remplacement.
- La primitive `Button size="lg"` reste en `h-9` (36 px); les boutons de s07 forcent toutefois `h-11` sans modifier la primitive.
- La variante `already_purchased=true` ne sait pas quel cours est concerné et renvoie vers l'accueil, comme le code actuel.
