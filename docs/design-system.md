# Design System — MasterGuitar

> Single source of truth for all UI decisions. Every story design builds on this system.

## Visual identity

**Theme**: Bois & Ambre — clair, chaleureux, convivial
**Accent**: Ambre/bois de guitare — chaud, artisanal, invitant
**Mode**: Clair uniquement (le mode sombre a été retiré — voir [ADR 007](../decisions/007-light-only-theme.md))

## Tokens

### Colors

Base system: shadcn/ui neutral palette with a warm amber accent. Single theme — no dark mode variant.

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#fbf6ee` | Page background (warm cream) |
| `--foreground` | `#332417` | Primary text (warm dark brown, not pure black) |
| `--card` | `#ffffff` | Card backgrounds |
| `--card-foreground` | `#332417` | Card text |
| `--muted` | `#f3ead9` | Subtle backgrounds |
| `--muted-foreground` | `#7a6c56` | Secondary text |
| `--border` | `#ecdfc9` | Borders, dividers |
| `--primary` | `#a3632a` | **Amber** — CTAs, links |
| `--primary-foreground` | `#fffaf3` | Text on primary |
| `--secondary` | `#f3ead9` | Secondary actions |
| `--accent` | `#f0dcc4` | Hover/highlight backgrounds |
| `--accent-foreground` | `#5c3a1c` | Text on accent |
| `--destructive` | `#c0392b` | Errors, delete |
| `--ring` | `#a3632a` | Focus rings |

**Amber accent**: `#a3632a` — evokes guitar wood/varnish. Darkened from the initial mockup shade (`#c1793a`) to clear WCAG AA (4.5:1) for button text.

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | Geist Sans | Body text, UI |
| `--font-mono` | Geist Mono | Code, technical |
| `--font-heading` | Geist Sans | Headings (same family, weight varies) |

**Scale** (Tailwind defaults):
- `text-xs`: 12px — captions, labels
- `text-sm`: 14px — secondary text, buttons
- `text-base`: 16px — body text
- `text-lg`: 18px — lead paragraphs
- `text-xl`: 20px — subheadings
- `text-2xl`: 24px — section titles
- `text-3xl`: 30px — page titles
- `text-4xl+`: 36px+ — hero headlines

**Weights**:
- `font-normal` (400): body
- `font-medium` (500): buttons, labels
- `font-semibold` (600): headings
- `font-bold` (700): emphasis, hero

### Spacing

Tailwind default scale: `4px` base unit.
- `p-1` = 4px
- `p-2` = 8px
- `p-3` = 12px
- `p-4` = 16px
- `p-6` = 24px
- `p-8` = 32px

**Consistent spacing**:
- Card padding: `p-4` (mobile), `p-6` (desktop)
- Section gaps: `gap-6` (mobile), `gap-8` (desktop)
- Form field gaps: `gap-4`

### Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 0.625rem (10px) | Base |
| `--radius-sm` | 6px | Small inputs, badges |
| `--radius-md` | 8px | Buttons, cards |
| `--radius-lg` | 10px | Modals, large cards |
| `--radius-xl` | 14px | Hero sections |

## Available components

shadcn/ui components installed via `npx shadcn add <name>`. Current inventory:

| Component | Status | Usage |
|-----------|--------|-------|
| `Button` | Installed | Primary actions, CTAs |
| `Input` | To add | Text inputs |
| `Label` | To add | Form labels |
| `Card` | To add | Content containers |
| `Dialog` | To add | Modals, confirmations |
| `DropdownMenu` | To add | Actions menu |
| `Avatar` | To add | User avatars |
| `Badge` | To add | Status indicators |
| `Tabs` | To add | Navigation within page |
| `Toast` | To add | Notifications |
| `Skeleton` | To add | Loading states |
| `Separator` | To add | Visual dividers |
| `ScrollArea` | To add | Scrollable containers |
| `Sheet` | To add | Mobile sidebars, drawers |

**Add as needed**: `npx shadcn add input label card` etc.

### Button variants

```tsx
<Button variant="default">Primary action</Button>
<Button variant="secondary">Secondary action</Button>
<Button variant="outline">Outlined</Button>
<Button variant="ghost">Subtle</Button>
<Button variant="destructive">Delete/Cancel</Button>
<Button variant="link">Inline link</Button>
```

**Sizes**: `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

## UI patterns

### Forms

- Labels above inputs, not inline
- Error messages below input, in `text-destructive`
- Required fields: no asterisk, just validate on submit
- Submit button: `variant="default"` (primary), full width on mobile
- Cancel/secondary: `variant="outline"` or `variant="ghost"`

```tsx
<form className="flex flex-col gap-4">
  <div className="flex flex-col gap-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" />
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
  <Button type="submit" className="w-full md:w-auto">Submit</Button>
</form>
```

### States

| State | Pattern |
|-------|---------|
| **Loading** | `<Skeleton />` for content, spinner for actions |
| **Empty** | Centered illustration + message + CTA |
| **Error** | Inline message or Toast, red accent |
| **Success** | Toast notification, green accent |

### Feedback

- **Toast**: bottom-right, auto-dismiss after 5s
- **Inline errors**: below the field, `text-destructive`
- **Loading buttons**: show spinner, disable click

### Navigation

- **Dashboard sidebar**: left, collapsible on mobile via `<Sheet>`
- **Public pages**: top navbar, sticky
- **Breadcrumbs**: for nested content (course > module > lesson)

### Cards

```tsx
<Card className="p-4 md:p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Mobile-first rules

1. **Start mobile**: design for 375px width first
2. **Breakpoints**: `md:` (768px) for tablet, `lg:` (1024px) for desktop
3. **Touch targets**: minimum 44x44px for interactive elements
4. **Stacked layouts**: single column on mobile, multi-column on desktop
5. **Sidebars**: hidden on mobile, shown in `<Sheet>` drawer

## Do / Don't

### Do
- Use semantic color tokens (`--primary`, `--muted`) not raw values
- Keep contrast ratio WCAG AA (4.5:1 for text)
- Use `gap` for spacing between elements, not margin hacks
- Add `aria-label` to icon-only buttons
- Test on mobile viewport (375px) before desktop
- Use `<Button>` from shadcn/ui, not raw `<button>`

### Don't
- Don't invent new colors outside the palette
- Don't reintroduce a `.dark` variant or a theme toggle — single light theme by design decision
- Don't hardcode pixel values for spacing (use Tailwind scale)
- Don't put important actions in hover-only states (mobile has no hover)
- Don't use more than 2 font weights on a single screen
- Don't skip focus states — keyboard navigation matters

## Icons

Library: **Lucide React**

```tsx
import { Play, Pause, ChevronRight } from "lucide-react"

<Play className="size-4" />
<Button size="icon"><Pause /></Button>
```

Default size: `size-4` (16px). Adjust with `size-5`, `size-6` as needed.

## Customization for MasterGuitar

The amber accent is applied in `globals.css`:

```css
:root {
  --primary: #a3632a;
  --ring: #a3632a;
}
```

This change replaces the original "Studio" dark/electric-blue identity (implemented in s01-project-foundation) with the light "Bois & Ambre" identity — see [ADR 007](../decisions/007-light-only-theme.md).
