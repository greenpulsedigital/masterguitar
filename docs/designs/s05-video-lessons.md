# Design — Story s05-video-lessons

## Screen(s)

### Course Edit Page — Lessons within Modules

**Location**: Within each module row on `/dashboard/courses/[id]`

**Layout decision**: Collapsible accordion pattern. Each module row expands to reveal its lessons. This keeps the UI clean when there are many modules, while allowing full lesson management when expanded.

```
┌─────────────────────────────────────────────────────────────┐
│ Modifier le cours                            [Supprimer]    │
├─────────────────────────────────────────────────────────────┤
│ [CourseForm - existing]                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Modules                                      [+ Ajouter]    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [↑][↓] [▶] Module 1: Introduction              [🗑]     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [↑][↓] [▼] Module 2: Techniques de base        [🗑]     │ │
│ │ ┌───────────────────────────────────────────────────┐   │ │
│ │ │  Leçons                          [+ Ajouter]      │   │ │
│ │ │                                                   │   │ │
│ │ │  ┌───────────────────────────────────────────┐   │   │ │
│ │ │  │ [↑][↓] Leçon 1: Accords majeurs     [🗑]  │   │   │ │
│ │ │  └───────────────────────────────────────────┘   │   │ │
│ │ │  ┌───────────────────────────────────────────┐   │   │ │
│ │ │  │ [↑][↓] Leçon 2: Accords mineurs     [🗑]  │   │   │ │
│ │ │  └───────────────────────────────────────────┘   │   │ │
│ │ └───────────────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Module Row (expanded)

When a module is expanded (chevron points down), lessons are visible:

```
┌─────────────────────────────────────────────────────────────┐
│ [↑][↓] [▼] Module title (click to edit)              [🗑]   │
├─────────────────────────────────────────────────────────────┤
│   Leçons                                     [+ Ajouter]    │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ [↑][↓]  Lesson title (click to edit)         [🗑]   │   │
│   └─────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ [↑][↓]  Another lesson                       [🗑]   │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Lesson Edit Dialog

Clicking a lesson title opens a dialog for full editing (title, description, video URL):

```
┌─────────────────────────────────────────────────────────────┐
│ Modifier la leçon                                     [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Titre                                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Accords majeurs                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Description (optionnel)                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Dans cette leçon, nous allons apprendre les accords     │ │
│ │ majeurs de base: Do, Ré, Mi...                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ URL vidéo                                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://youtube.com/watch?v=abc123                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Aperçu vidéo                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │               [16:9 video embed]                        │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                                    [Annuler]  [Enregistrer] │
└─────────────────────────────────────────────────────────────┘
```

### Video Preview Component

- Responsive 16:9 aspect ratio container
- Supports YouTube, Vimeo, and generic embed URLs
- Shows placeholder with Video icon when no URL or invalid URL

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     [▶ Video icon]                          │
│                  Aucune vidéo ajoutée                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Mockup

`docs/designs/s05-video-lessons.html` — visual reference. DO NOT copy into production: Execute builds with the real components.

---

## Reused components (from the design system)

| Component | Where / Why |
|-----------|-------------|
| `Button` | "Ajouter une leçon" (`variant="ghost"`, `size="sm"`), reorder (`variant="ghost"`, `size="icon-sm"`), delete (`variant="ghost"`, `size="icon"`), dialog actions |
| `Input` | Lesson title in edit dialog |
| `Textarea` | Lesson description (multi-line) |
| `Dialog` | Lesson edit form, delete confirmation |
| `Label` | Form field labels in edit dialog |
| `Card` | Not used directly for lessons — they nest inside module Card |

**Icons** (Lucide React):
- `ChevronRight` / `ChevronDown` — module expand/collapse toggle
- `ChevronUp` / `ChevronDown` — lesson reorder buttons
- `Trash2` — delete lesson button
- `Plus` — add lesson button (in "Ajouter une leçon")
- `Video` — empty video preview placeholder

---

## States

### Empty state (no lessons in module)

```
┌─────────────────────────────────────────────────────────────┐
│   Leçons                                     [+ Ajouter]    │
│                                                             │
│                      [🎬 Video icon]                        │
│                    Aucune leçon                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Icon: `Video` in `text-muted-foreground`
- Text: "Aucune leçon", centered, `text-muted-foreground`
- CTA: "Ajouter" button in header suffices

### Loading state

- `Skeleton` bars where lesson rows would be (rare, server component)

### Error state

- Inline error message below the form field: `text-sm text-destructive`
- Example: "Erreur lors de la sauvegarde"

### Success state

- No explicit success feedback — changes visible immediately (optimistic UI)
- Dialog closes on successful save

### Video preview states

| State | Display |
|-------|---------|
| No URL | Video icon + "Aucune vidéo ajoutée" centered |
| Valid URL | Responsive 16:9 iframe embed |
| Invalid URL | Video icon + "URL invalide" in `text-destructive` |

---

## Interactions

### Expand/collapse module

1. Click chevron (▶/▼) on module row
2. Module expands to show lessons section
3. Chevron rotates from right-pointing to down-pointing
4. State persists in local component state (not URL)

### Add lesson

1. Click "Ajouter" in lessons header
2. New lesson created with title "Nouvelle leçon", order = max + 1
3. Edit dialog opens immediately for the new lesson
4. User fills in details, clicks "Enregistrer"

### Edit lesson

1. Click lesson title in the list
2. Edit dialog opens with current values
3. User modifies fields
4. Video preview updates live as URL changes
5. Click "Enregistrer" → save, close dialog
6. Click "Annuler" or ✕ → discard changes, close dialog

### Reorder lesson

1. Click ↑ or ↓ button on lesson row
2. Lesson swaps position with adjacent lesson (optimistic)
3. ↑ disabled on first lesson, ↓ disabled on last

### Delete lesson

1. Click trash icon on lesson row
2. Confirmation dialog: "Supprimer la leçon"
3. Confirm → lesson removed (optimistic)
4. Cancel → dialog closes

---

## Design system gaps

### Collapsible/Accordion component

The design system doesn't include a Collapsible or Accordion component. Options:

1. **Use shadcn/ui Collapsible** — add via `npx shadcn add collapsible`
2. **Simple state toggle** — use local state + conditional rendering (no new component)

**Recommendation**: Use simple state toggle. The expand/collapse is straightforward and doesn't need the full Collapsible primitive. If future stories need more complex accordion behavior, add the component then.

### No gap in tokens or patterns

All colors, spacing, typography, and patterns needed are covered by the existing design system.
