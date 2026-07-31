# Design — Story s02-prof-auth

## Screens

### 1. Login Page (`/login`)

**Layout**: Centered card on dark background

**Structure**:
```
[Card - max-w-md mx-auto]
  [CardHeader]
    Title: "Connexion" (text-2xl font-semibold)
    Description: "Accédez à votre espace prof" (text-muted-foreground)
  [CardContent]
    [Form - flex flex-col gap-4]
      [Field]
        Label: "Email"
        Input: type="email" placeholder="nom@exemple.com"
      [Field]
        Label: "Mot de passe"
        Input: type="password"
      [Error zone - text-sm text-destructive, hidden by default]
      Button: "Se connecter" (variant="default", full width)
  [CardFooter]
    Text: "Pas encore de compte ?" + Link: "S'inscrire" → /signup
```

**Components used** (from design system):
- `Card`, `CardHeader`, `CardContent`, `CardFooter`
- `Label`
- `Input`
- `Button` (variant="default")

### 2. Signup Page (`/signup`)

**Layout**: Centered card on dark background

**Structure**:
```
[Card - max-w-md mx-auto]
  [CardHeader]
    Title: "Créer un compte" (text-2xl font-semibold)
    Description: "Rejoignez MasterGuitar" (text-muted-foreground)
  [CardContent]
    [Form - flex flex-col gap-4]
      [Field]
        Label: "Nom"
        Input: type="text" placeholder="Votre nom"
      [Field]
        Label: "Email"
        Input: type="email" placeholder="nom@exemple.com"
      [Field]
        Label: "Mot de passe"
        Input: type="password" placeholder="Minimum 8 caractères"
      [Field - checkbox]
        Checkbox + Label: "Je suis prof de guitare"
        Description: "Cochez pour créer et vendre des cours" (text-xs text-muted-foreground)
      [Error zone]
      Button: "Créer mon compte" (variant="default", full width)
  [CardFooter]
    Text: "Déjà un compte ?" + Link: "Se connecter" → /login
```

**Components used**:
- `Card`, `CardHeader`, `CardContent`, `CardFooter`
- `Label`
- `Input`
- `Checkbox` (to add)
- `Button` (variant="default")

### 3. Dashboard Page (`/dashboard`)

**Layout**: Simple placeholder for this story

**Structure**:
```
[Container]
  [Title]: "Tableau de bord" (text-3xl font-semibold)
  [Text]: "Bienvenue, {email}" (text-muted-foreground)
  [Card - placeholder]
    "Vos cours apparaîtront ici."
```

### 4. Header (authenticated state)

**Structure** (right side of nav):
```
[nav - flex items-center gap-4]
  [When logged out]
    Link: "Se connecter" → /login (variant="ghost")
    Button: "S'inscrire" → /signup (variant="default")
  [When logged in]
    Text: "{email}" (text-sm text-muted-foreground)
    Button: "Déconnexion" (variant="ghost")
```

## Design tokens applied

| Element | Token/Class |
|---------|-------------|
| Page background | `bg-background` |
| Card | `bg-card`, `border`, `rounded-lg` |
| Title | `text-2xl font-semibold text-foreground` |
| Description | `text-muted-foreground` |
| Input | shadcn Input (inherits tokens) |
| Primary button | `bg-primary text-primary-foreground` |
| Error text | `text-destructive text-sm` |
| Link | `text-primary hover:underline` |

## Mobile considerations

- Cards: `w-full max-w-md` — full width on mobile, constrained on desktop
- Form fields: stacked vertically, `gap-4`
- Buttons: `w-full` on mobile
- Touch targets: all buttons/inputs at least 44px height

## Components to add

Before implementation, run:
```bash
npx shadcn add input label card checkbox
```
