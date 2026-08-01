# Design — Story s04-course-structure

## Screen(s)

### Course Edit Page — Modules Section

**Location**: Below the existing CourseForm on `/dashboard/courses/[id]`

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ Modifier le cours                    [Supprimer]    │
├─────────────────────────────────────────────────────┤
│ [CourseForm - existing]                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Modules                              [+ Ajouter]    │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [↑] [↓]  Module title (inline editable)   [🗑]  │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [↑] [↓]  Module title                     [🗑]  │ │
│ └─────────────────────────────────────────────────┘ │
│ ...                                                 │
│                                                     │
│ (Empty state: centered message + CTA)               │
└─────────────────────────────────────────────────────┘
```

**Hierarchy**:
1. Page title + delete button (existing)
2. CourseForm (existing)
3. **NEW: Modules section**
   - Section header: "Modules" + "Ajouter un module" button
   - Module list: vertical stack of module rows
   - Each row: reorder buttons (up/down) + title (inline edit) + delete button

### Module Row

Each module displayed as a horizontal row:

```
┌──────────────────────────────────────────────────────┐
│ [↑][↓]   Titre du module                        [🗑] │
└──────────────────────────────────────────────────────┘
```

- **Left**: Up/Down icon buttons (`variant="ghost"`, `size="icon-sm"`)
- **Center**: Module title — click to edit inline, blur/Enter to save
- **Right**: Delete button (`variant="ghost"`, destructive on hover)

### Inline Edit Mode

When clicking the title:
```
┌──────────────────────────────────────────────────────┐
│ [↑][↓]   [________________input________________] [🗑] │
└──────────────────────────────────────────────────────┘
```

- Input replaces title text
- Auto-focus, select all
- Blur or Enter saves
- Escape cancels

---

## Mockup

`docs/designs/s04-course-structure.html` — visual reference. DO NOT copy into production: Execute builds with the real components.

---

## Reused components (from the design system)

| Component | Where / Why |
|-----------|-------------|
| `Card` | Container for the modules section |
| `Button` | "Ajouter un module" (variant=default), reorder (variant=ghost, size=icon-sm), delete (variant=ghost) |
| `Input` | Inline edit field for module title |
| `Dialog` | Delete confirmation (reuse existing pattern from course delete) |

**Icons** (Lucide React):
- `Plus` — add module button
- `ChevronUp` / `ChevronDown` — reorder buttons
- `Trash2` — delete button

---

## States

### Empty state
No modules yet.
```
┌─────────────────────────────────────────────────────┐
│ Modules                              [+ Ajouter]    │
│                                                     │
│           📦  Aucun module                          │
│      Ajoutez des modules pour structurer           │
│              votre cours.                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- Icon: `Package` (Lucide) in `text-muted-foreground`
- Text: centered, `text-muted-foreground`
- CTA: the "Ajouter" button in header suffices

### Loading state
When fetching modules (rare, server component):
- `Skeleton` bars where module rows would be

### Error state
If a module action fails:
- Inline error message below the module row: `text-sm text-destructive`
- Example: "Erreur lors de la suppression"

### Success state
- No explicit success feedback needed — changes are visible immediately (optimistic UI)
- Delete confirmation dialog closes on success

---

## Interactions

### Add module
1. Click "Ajouter un module"
2. New module row appears at bottom with default title "Nouveau module"
3. Title is immediately in edit mode (input focused)
4. User types, presses Enter or blurs → saved

### Rename module
1. Click on module title
2. Title becomes editable input
3. Enter or blur → save
4. Escape → cancel, revert to previous

### Reorder module
1. Click ↑ or ↓ button
2. Module swaps position with adjacent module (optimistic)
3. Server action updates `order` fields
4. ↑ disabled on first module, ↓ disabled on last

### Delete module
1. Click trash icon
2. Dialog opens: "Supprimer le module"
3. Confirm → module removed (optimistic), server action deletes
4. Cancel → dialog closes, no change

---

## Design system gaps

None identified. All required components (Card, Button, Input, Dialog) and tokens (colors, spacing) are available in the design system.
