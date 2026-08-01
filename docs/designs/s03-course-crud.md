# Design — Story s03-course-crud

## Screens

### 1. Course List Page (`/dashboard/courses`)

**Layout**: Full-width container with responsive grid

**Structure**:
```
[Header - already exists, shows user email + logout]

[Container - container mx-auto p-4 md:p-6]
  [Page header - flex justify-between items-center mb-6]
    [Title]: "Mes cours" (text-3xl font-semibold)
    [Button]: "Nouveau cours" (variant="default") → /dashboard/courses/new

  [Course grid - grid gap-4 md:grid-cols-2 lg:grid-cols-3]
    [CourseCard - repeat for each course]
      [Card - p-4]
        [Thumbnail - aspect-video bg-muted rounded-md mb-3]
          if thumbnailUrl: <img src={thumbnailUrl} className="object-cover" />
          else: placeholder icon (Image from lucide)
        [Title]: course.title (text-lg font-semibold truncate)
        [Price]: formatted price (text-sm text-muted-foreground)
        [Status badge - inline-flex items-center gap-1]
          if DRAFT: Badge variant="secondary" "Brouillon"
          if PUBLISHED: Badge variant="default" "Publié"
        [Actions - flex gap-2 mt-3]
          Button variant="outline" size="sm": "Modifier" → /dashboard/courses/[id]
          Button variant="ghost" size="icon-sm": Trash2 icon → opens delete dialog

  [Empty state - if no courses]
    [Card - p-8 text-center]
      [Icon]: BookOpen (size-12, text-muted-foreground, mx-auto mb-4)
      [Text]: "Aucun cours pour l'instant" (text-lg font-medium)
      [SubText]: "Créez votre premier cours pour commencer" (text-muted-foreground)
      [Button]: "Créer un cours" (variant="default", mt-4)

[Footer - already exists]
```

**Components used**:
- `Card`
- `Button` (variant="default", "outline", "ghost")
- `Badge` (to add: `npx shadcn add badge`)

### 2. Create Course Page (`/dashboard/courses/new`)

**Layout**: Centered form card

**Structure**:
```
[Container - container mx-auto p-4 md:p-6 max-w-2xl]
  [Back link - flex items-center gap-1 text-sm text-muted-foreground mb-6]
    ChevronLeft icon
    "Retour aux cours"

  [Card - p-4 md:p-6]
    [CardHeader]
      Title: "Nouveau cours" (text-2xl font-semibold)
      Description: "Créez un nouveau cours pour vos élèves" (text-muted-foreground)

    [CardContent]
      [Form - flex flex-col gap-4]
        [Field]
          Label: "Titre"
          Input: type="text" name="title" placeholder="Ex: Débuter la guitare"

        [Field]
          Label: "Description"
          Textarea: name="description" placeholder="Décrivez votre cours..." rows={4}

        [Field]
          Label: "Prix (€)"
          Input: type="number" name="price" min="0" step="0.01" placeholder="49.99"
          HelpText: "Prix en euros, laissez 0 pour gratuit" (text-xs text-muted-foreground)

        [Field]
          Label: "Image de couverture (URL)"
          Input: type="url" name="thumbnailUrl" placeholder="https://..."
          HelpText: "Collez l'URL d'une image hébergée" (text-xs text-muted-foreground)

        [Error zone - text-sm text-destructive, hidden by default]

        [Actions - flex gap-3 justify-end mt-2]
          Button variant="outline": "Annuler" → /dashboard/courses
          Button variant="default": "Créer le cours"
```

**Components used**:
- `Card`, `CardHeader`, `CardContent`
- `Label`
- `Input`
- `Textarea` (to add: `npx shadcn add textarea`)
- `Button` (variant="default", "outline")

### 3. Edit Course Page (`/dashboard/courses/[id]`)

**Layout**: Same as create, prefilled values

**Structure**:
```
[Container - container mx-auto p-4 md:p-6 max-w-2xl]
  [Back link]

  [Card - p-4 md:p-6]
    [CardHeader]
      Title: "Modifier le cours" (text-2xl font-semibold)
      Description: course.title (text-muted-foreground)

    [CardContent]
      [Form - same fields as create, with defaultValue={course.fieldName}]
        [Field: Titre] - defaultValue={course.title}
        [Field: Description] - defaultValue={course.description}
        [Field: Prix] - defaultValue={course.price / 100} (convert cents to euros)
        [Field: Thumbnail URL] - defaultValue={course.thumbnailUrl}

        [Error zone]

        [Actions - flex gap-3 justify-between mt-2]
          [Left side]
            Button variant="destructive" size="sm": "Supprimer" → opens delete dialog
          [Right side - flex gap-3]
            Button variant="outline": "Annuler"
            Button variant="default": "Enregistrer"
```

### 4. Delete Confirmation Dialog

**Component**: shadcn Dialog (modal)

**Structure**:
```
[Dialog]
  [DialogContent - max-w-sm]
    [DialogHeader]
      DialogTitle: "Supprimer ce cours ?"
      DialogDescription: "Cette action est irréversible. Le cours \"{title}\" sera définitivement supprimé."

    [DialogFooter - flex gap-3 justify-end]
      Button variant="outline": "Annuler" → closes dialog
      Button variant="destructive": "Supprimer" → calls deleteCourse action
```

**Components used**:
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` (to add: `npx shadcn add dialog`)
- `Button` (variant="outline", "destructive")

## Design tokens applied

| Element | Token/Class |
|---------|-------------|
| Page background | `bg-background` |
| Card | `bg-card border rounded-lg` |
| Page title | `text-3xl font-semibold text-foreground` |
| Card title | `text-2xl font-semibold` |
| Description | `text-muted-foreground` |
| Input | shadcn Input (inherits tokens) |
| Primary button | `bg-primary text-primary-foreground` |
| Destructive button | `bg-destructive text-destructive-foreground` |
| Error text | `text-destructive text-sm` |
| Help text | `text-xs text-muted-foreground` |
| Badge (draft) | `bg-secondary text-secondary-foreground` |
| Badge (published) | `bg-primary text-primary-foreground` |

## Mobile considerations

- Course grid: 1 column on mobile (`grid`), 2 columns on tablet (`md:grid-cols-2`), 3 on desktop (`lg:grid-cols-3`)
- Form: full width on mobile, max-w-2xl centered on desktop
- Cards: `p-4` padding on mobile, `p-6` on desktop (`p-4 md:p-6`)
- Buttons: full width on mobile forms (`w-full md:w-auto`)
- Touch targets: all buttons/inputs at least 44px height
- Back link: touch-friendly padding

## Components to add

Before implementation, run:
```bash
npx shadcn add textarea badge dialog
```

## Icons used

From Lucide React:
- `ChevronLeft` — back navigation
- `Plus` — add new (optional, can use text)
- `Trash2` — delete action
- `BookOpen` — empty state illustration
- `Image` — thumbnail placeholder
