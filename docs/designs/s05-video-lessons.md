# Design — Story s05-video-lessons

## Screen(s)

### Course Edit Page — Lessons nested under each Module

**Location**: Extends the existing Modules section on `/dashboard/courses/[id]` (added in s04). Each module row now shows its lessons directly underneath, nested inside the same module block — no new page, no new route.

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ Modules                                  [+ Ajouter]     │
│                                                           │
│ ┌───────────────────────────────────────────────────┐   │
│ │ [↑][↓]  Introduction à la guitare            [🗑]  │   │
│ │ ┌───────────────────────────────────────────────┐ │   │
│ │ │  Leçons                        [+ Ajouter]     │ │   │
│ │ │  [↑][↓]  Comment tenir sa guitare  [✎][🗑]     │ │   │
│ │ │  [↑][↓]  Les premières notes       [✎][🗑]     │ │   │
│ │ └───────────────────────────────────────────────┘ │   │
│ └───────────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────────┐   │
│ │ [↑][↓]  Les accords de base                  [🗑]  │   │
│ │  (aucune leçon — état vide)                        │   │
│ └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Hierarchy**:
1. Modules section (existing, s04) — unchanged: header, module rows, reorder/rename/delete.
2. **NEW**: inside each module row, a nested "Leçons" sub-block:
   - Sub-header: "Leçons" + "Ajouter une leçon" button (`size="sm"`, smaller than the module-level button to keep visual hierarchy)
   - Lesson list: compact rows, one per lesson
   - Each row: reorder (↑↓) + title (plain text, NOT inline-editable — a lesson has 3 fields, so editing opens a dialog) + edit (pencil) + delete (trash)

### Lesson row (compact, read-only title)

```
┌───────────────────────────────────────────────────┐
│ [↑][↓]   Comment tenir sa guitare        [✎] [🗑]  │
└───────────────────────────────────────────────────┘
```
Unlike a module row (title is click-to-edit inline), a lesson title is plain text — clicking the pencil opens the Add/Edit Lesson dialog, since title/description/videoUrl together don't fit an inline row.

### Add/Edit Lesson dialog

Reuses the existing `Dialog` pattern (already used for delete confirmation in s03/s04). Triggered by "Ajouter une leçon" (create) or the pencil icon on a row (edit, pre-filled).

```
┌─────────────────────────────────────────────┐
│ Ajouter une leçon                       [x]  │
├─────────────────────────────────────────────┤
│ Titre                                        │
│ [_____________________________________]     │
│                                               │
│ Description                                  │
│ [_____________________________________]     │
│ [_____________________________________]     │
│                                               │
│ URL vidéo                                    │
│ [_____________________________________]     │
│                                               │
│ Aperçu                                       │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │         [iframe preview / placeholder] │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                               │
│                        [Annuler] [Enregistrer] │
└─────────────────────────────────────────────┘
```

- Title: `Input`, required.
- Description: `Textarea`, optional (same as `CourseForm`'s description field).
- Video URL: `Input` type url, optional at the DB layer — validated as a well-formed URL if provided (mirrors `CourseForm`'s `thumbnailUrl` pattern: `z.string().url().optional().or(z.literal(""))`).
- Preview: a plain `<iframe src={videoUrl}>` (16:9, `aspect-video`) rendered live as the URL field changes, client-side. No URL normalization/parsing — the prof pastes an already-embeddable URL (YouTube/Vimeo "embed" link), per the story's own note ("Pas de player avancé ici, juste l'embed basique") and confirmed in research: no embed/parsing utility exists anywhere in the codebase today, and none is introduced here.
- Empty video URL → preview area shows a muted placeholder ("Ajoutez une URL vidéo pour voir l'aperçu"), not an empty iframe.

---

## Mockup

`docs/designs/s05-video-lessons.html` — visual reference, current light "Bois & Ambre" theme tokens. DO NOT copy into production: Execute builds with the real components.

> Note: the s04 mockup (`docs/designs/s04-course-structure.html`) was built before ADR 007 and still uses the old dark "Studio" palette — it's stale as a visual reference (structure only, not colors). This mockup uses the current tokens from `docs/design-system.md`.

---

## Reused components (from the design system)

| Component | Where / Why |
|-----------|-------------|
| `Card` | Nested "Leçons" sub-block container, matches the Modules card treatment |
| `Button` | "Ajouter une leçon" (`variant="default"`, `size="sm"`), reorder (`variant="ghost"`, `size="icon-sm"`), edit/delete (`variant="ghost"`, `size="icon-sm"`) |
| `Dialog` | Add/Edit Lesson form — same pattern as the existing delete-confirmation dialogs |
| `Input` | Title, Video URL fields |
| `Textarea` | Description field (same component `CourseForm` already uses) |
| `Label` | Field labels, above each input (per design system form pattern) |

**Icons** (Lucide React):
- `Plus` — "Ajouter une leçon"
- `ChevronUp` / `ChevronDown` — reorder
- `Pencil` — edit (open dialog)
- `Trash2` — delete
- `Video` — empty-state icon for "no lessons yet"

---

## States

### Empty state (no lessons in a module)
```
┌───────────────────────────────────────────┐
│  Leçons                    [+ Ajouter]     │
│                                             │
│        🎬  Aucune leçon                    │
│   Ajoutez des leçons vidéo à ce module.    │
└───────────────────────────────────────────┘
```
Smaller/more compact than the module-level empty state (this is a nested sub-section, not the whole page) — icon `Video`, `text-muted-foreground`, no separate CTA beyond the header button.

### Loading state
Server component — no client loading state for the initial list. The dialog's "Enregistrer" button shows a disabled/spinner state while the server action runs (per design system's "Loading buttons: show spinner, disable click").

### Error state
- Dialog: inline error message below the relevant field or at the bottom of the form, `text-sm text-destructive` (mirrors `CourseForm`'s error handling).
- List actions (reorder/delete failing): same inline pattern used by modules — a `text-sm text-destructive` message near the affected row.

### Success state
- Dialog closes on successful save; the (optimistically or freshly re-rendered) list reflects the change immediately — no toast, consistent with how module edits behave today (no toast infrastructure is installed; `Toast` is still "To add" in the component inventory).

---

## Interactions

### Add lesson
1. Click "Ajouter une leçon" (inside a module's Leçons sub-block)
2. Dialog opens, empty form, title field focused
3. Fill title (required), description/videoUrl optional
4. Typing/pasting a URL into Video URL live-updates the preview iframe below it
5. "Enregistrer" → server action creates the lesson at the end of the module's list (`order = max + 1`, mirrors `createModule`) → dialog closes → list updates
6. "Annuler" or close (x) → dialog closes, nothing saved

### Edit lesson
1. Click the pencil icon on a lesson row
2. Dialog opens pre-filled with the lesson's current title/description/videoUrl (preview shows the existing video immediately)
3. Edit any field → "Enregistrer" → server action updates → dialog closes → row reflects changes

### Reorder lesson
1. Click ↑ or ↓ on a lesson row
2. Swaps with the adjacent lesson within the same module (never crosses into another module's list) — same swap-based mechanic as `reorderModule`
3. ↑ disabled on the first lesson of the module, ↓ disabled on the last

### Delete lesson
1. Click trash icon on a lesson row
2. `Dialog` confirmation: "Supprimer la leçon" / "Êtes-vous sûr de vouloir supprimer cette leçon ? Cette action est irréversible." (same copy pattern as module/course delete)
3. Confirm → lesson removed, server action deletes
4. Cancel → dialog closes, no change

---

## Design system gaps

None. `Card`, `Button`, `Dialog`, `Input`, `Textarea`, `Label` are all already installed and used elsewhere (`CourseForm`, `ModuleList`). The video preview is a plain `<iframe>` styled with existing tokens (`--border`, `--radius-md`, `--muted` for the empty placeholder) — not a component, so nothing to add to the inventory.
