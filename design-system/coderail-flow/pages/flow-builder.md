# Flow Builder Page Overrides

> **PROJECT:** CodeRail Flow
> **Page Type:** Builder / Editor

> Rules in this file **override** the Master file. For all other rules, refer to MASTER.md.

---

## Layout

- **Structure:** Two-panel — left (step list + config), right (preview/recorder)
- **Step list:** Scrollable, card background, min-width 300px
- **Preview:** Flexible width, iframe or screenshot view

## Typography Overrides

- **Step numbers:** 10px in 20px circle badge
- **Step descriptions:** 12px, ellipsis overflow
- **Subtitle input:** 11px, monospace-feel
- **Section headers:** 14-15px, weight 500

## Color Overrides

- **Action type colors:**
  - Navigate: `#60a5fa` (blue)
  - Click: `#f59e0b` (amber)
  - Fill: `#22c55e` (green)
  - Default: `#8b8b8b` (gray)
- **Active step:** `#1e1a2e` bg, `#6366f1` border (indigo)
- **Subtitle active:** `rgba(99,102,241,0.08)` bg, `#c4b5fd` text

## Component Overrides

- **Step items:** 8px 10px padding, 6px border-radius, cursor pointer
- **Toolbar buttons:** min-height 32px, 8px padding, aria-labels required
- **Delete buttons:** 8px padding, Trash2 icon at 14px, `aria-label` required
- **Quick Add buttons:** Compact, 11px font, 4px 8px padding
- **Flow name/description inputs:** sr-only labels + aria-label

## Interaction

- Click step to select, highlight with indigo border
- Delete button: stopPropagation to avoid selecting
- Inline subtitle editing per step
- Chevron nav between steps (prev/next)

## Onboarding Wizard (sub-component)

- **Modal:** ESC to close, focus trap, aria-modal
- **Progress bar:** Step dots + progress line
- **Option cards:** lucide-react icons (NOT emojis), box-shadow hover
- **Navigation:** Back/Continue buttons, disabled state at opacity 0.5
