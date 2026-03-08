# Dashboard Page Overrides

> **PROJECT:** CodeRail Flow
> **Page Type:** Dashboard / Data View

> Rules in this file **override** the Master file. For all other rules, refer to MASTER.md.

---

## Layout

- **Max Width:** 980px (`.container`)
- **Nav:** Sticky top, backdrop-blur, links: Dashboard, Flows, Projects, Billing
- **Sections:** Stat Cards > Charts > Runs Table
- **Container padding:** 24px

## Typography Overrides

- **Page title:** 22px (`.h1`), weight 700
- **Stat numbers:** 24px, weight 700
- **Table text:** 13px
- **Labels/captions:** 12px, `#a8b3cf`

## Color Overrides

- **Stat card icons:** Colored backgrounds at 15% opacity (blue, green, amber, purple)
- **Status badges:**
  - Success: `#22c55e` text, `rgba(34,197,94,0.1)` bg
  - Failed: `#f44336` text, `rgba(244,67,54,0.1)` bg
  - Running: `#3b82f6` text, `rgba(59,130,246,0.1)` bg
  - Queued: `#8b95b0` text, `rgba(139,149,176,0.1)` bg
- **Active nav link:** `#e6e9f2` with bottom border accent

## Component Overrides

- **Stat cards:** 4-column grid, icon + label + value, card background
- **Runs table:** Full-width, `.table` class, sortable columns
- **Date range select:** Top-right, `aria-label="Date range"`
- **Empty state:** Centered icon + message + CTA button
- **Loading:** Spinner (`.dash-spinner`) — consider skeleton screens for <1s loads

## Responsive

- Stat cards: 2-col at 768px, 1-col at 375px
- Table: horizontal scroll wrapper on mobile
- Nav links: collapse to hamburger at 768px
