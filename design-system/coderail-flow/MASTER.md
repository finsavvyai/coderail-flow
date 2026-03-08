# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** CodeRail Flow
**Updated:** 2026-03-07
**Category:** SaaS Browser Automation Platform
**Theme:** Dark Mode (OLED-optimized)

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Background | `#0b0f19` | `--bg` | Page background |
| Card | `#121a2b` | `--bg-card` | Cards, panels |
| Deep | `#080c15` | `--bg-dark` | Alternate sections |
| Border | `#1f2a44` | `--border` | Borders, dividers |
| Accent | `#2b7cff` | `--accent` | Primary actions, links |
| Accent Hover | `#1a6aee` | `--accent-hover` | Hover states |
| Text | `#e6e9f2` | `--text` | Primary text |
| Text Muted | `#8b95b0` | `--text-muted` | Secondary text |
| Text Dim | `#5a6580` | `--text-dim` | Tertiary, captions |
| Success | `#22c55e` | `--success` | Positive status |
| Warning | `#f59e0b` | `--warning` | Warning status |
| Error | `#f44336` | `--error` | Error status |
| Info | `#3b82f6` | `--info` | Info, in-progress |

**Gradient:** `linear-gradient(135deg, #2b7cff, #7c3aed)` for hero text

### Typography

- **Font Stack:** `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial`
- **Monospace:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
- **Mood:** Clean, professional, system-native (fast loading, no FOUT)

| Scale | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | `clamp(32px, 5vw, 56px)` | 800 | Hero titles |
| H1 | `22px` | 700 | Page titles |
| H2 | `16px` | 700 | Section headings |
| Body | `14-15px` | 400 | Body text |
| Small | `12-13px` | 400 | Labels, captions |
| Mono | `13px` | 400 | Code, technical data |

### Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `4px` | Tight gaps, icon padding |
| `sm` | `8px` | Icon gaps, inline spacing |
| `md` | `12px` | Component gaps |
| `lg` | `16px` | Standard padding |
| `xl` | `20px` | Card padding |
| `2xl` | `24px` | Section padding, container |
| `3xl` | `32px` | Large gaps |
| `4xl` | `48px` | Section margins |
| `5xl` | `80px` | Hero/section padding |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `6px` | Small buttons, badges |
| `md` | `8px` | Buttons |
| `lg` | `10px` | Inputs |
| `xl` | `12px` | Modals |
| `2xl` | `14px` | Cards |
| `full` | `999px` | Pills, badges |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `sm` | `0 1px 3px rgba(0,0,0,0.2)` | Subtle lift |
| `md` | `0 4px 12px rgba(0,0,0,0.3)` | Cards, toasts |
| `lg` | `0 10px 20px rgba(0,0,0,0.3)` | Modals, dropdowns |
| `glow` | `0 4px 12px rgba(43,124,255,0.15)` | Accent hover glow |
| `glow-lg` | `0 4px 16px rgba(43,124,255,0.1)` | Feature card hover |

### Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `base` | `0` | Default content |
| `dropdown` | `10` | Dropdowns, tooltips |
| `sticky` | `100` | Sticky nav |
| `modal` | `1000` | Modals, overlays |
| `toast` | `1100` | Toast notifications |

---

## Component Specs

### Buttons

```css
/* Primary */
.btn {
  background: #2b7cff;
  color: white;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 500;
  min-height: 44px;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
}
.btn:hover { box-shadow: 0 4px 12px rgba(43,124,255,0.3); }
.btn:focus-visible { outline: 2px solid #2b7cff; outline-offset: 2px; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
```

**Variants:** Primary (blue bg), Ghost (transparent + border), Danger (red bg)
**Max variants:** 4 (Primary, Secondary, Ghost, Danger)

### Cards

```css
.card {
  background: #121a2b;
  border: 1px solid #1f2a44;
  border-radius: 14px;
  padding: 16px;
}
.card:hover (if interactive) {
  border-color: #2b7cff;
  box-shadow: 0 4px 16px rgba(43,124,255,0.1);
}
```

### Inputs

```css
.input {
  background: #0b1224;
  border: 1px solid #1f2a44;
  color: #e6e9f2;
  padding: 12px 14px;
  border-radius: 10px;
  min-height: 44px;
}
.input:focus-visible { outline: 2px solid #2b7cff; outline-offset: 1px; }
```

### Modals

- Overlay: `rgba(0,0,0,0.7)`, z-index: 1000
- Panel: `background: #1a1a1a`, border-radius: 12px
- Close button: 44px touch target, `aria-label="Close dialog"`
- Focus trap: Tab cycles within modal
- ESC key: closes modal
- `role="dialog"` + `aria-modal="true"`

### Toasts

- Position: bottom-right, z-index: 1100
- Style: dark card + colored left border
- Auto-dismiss: 4s (errors require manual dismiss)
- Icons: lucide-react SVGs (not Unicode symbols)
- `role="status"` on message text

---

## Interaction Rules

### Hover States

- Use `box-shadow` or `border-color` changes (NOT `translateY`)
- Transitions: 150-200ms ease
- Cards: border glow effect
- Buttons: shadow glow effect

### Focus States

- All interactive elements: `focus-visible` with 2px accent outline
- Offset: 2px
- Never remove default focus outlines without replacement

### Touch Targets

- Minimum: 44x44px for all interactive elements
- Icon-only buttons: padding >= 10px
- Small action buttons: min-height: 32px (toolbar), 44px (primary)

### Animations

- Micro-interactions: 150-300ms
- Page transitions: 200-300ms
- Respect `prefers-reduced-motion: reduce`

---

## Accessibility Requirements

- **Contrast:** 4.5:1 minimum for text, 3:1 for UI components
- **ARIA:** Labels on all icon-only buttons, `role="dialog"` on modals
- **Forms:** Every input needs a `<label>` (visible or `.sr-only`)
- **Keyboard:** Full Tab navigation, ESC closes modals
- **Focus trap:** Modals must trap focus
- **Motion:** Honor `prefers-reduced-motion`
- **Screen readers:** `role="status"` for live updates (toasts, progress)

---

## Icon System

- **Library:** lucide-react
- **Default size:** 16px (inline), 18px (buttons), 24px (feature icons)
- **Never use:** Emoji as UI icons
- **Consistency:** Same icon set throughout entire app

---

## Anti-Patterns (Do NOT Use)

- Emojis as icons
- `translateY` on hover (causes layout shift)
- Missing `cursor: pointer` on clickable elements
- z-index values > 1100
- Inline `color: '#666'` or `'#888'` for interactive elements (too low contrast)
- `transform: scale()` on hover without `will-change`
- Spinners for waits < 1s (use skeleton screens)
- Placeholder text as the only label

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (use lucide-react SVGs)
- [ ] All icons from lucide-react (consistent set)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover: box-shadow/border, not translateY
- [ ] Transitions: 150-200ms
- [ ] All text: 4.5:1 contrast minimum
- [ ] Focus-visible on every interactive element
- [ ] `prefers-reduced-motion` respected
- [ ] Touch targets >= 44px
- [ ] Forms: every input has a label
- [ ] Modals: focus trap + ESC + ARIA
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] z-index follows scale (100, 1000, 1100)
