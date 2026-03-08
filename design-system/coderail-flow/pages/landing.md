# Landing Page Overrides

> **PROJECT:** CodeRail Flow
> **Page Type:** Landing / Marketing

> Rules in this file **override** the Master file. For all other rules, refer to MASTER.md.

---

## Layout

- **Max Width:** 1100px (`.lp-section-inner`)
- **Nav:** Sticky, backdrop-blur(16px), `rgba(11, 15, 25, 0.85)`
- **Sections:** Hero > Logo Bar > Features Grid > How It Works > Pricing > Waitlist CTA > Footer
- **Hero padding:** 80px top, 60px bottom (48px/40px on mobile)

## Typography Overrides

- **Hero title:** `clamp(32px, 5vw, 56px)`, weight 800, letter-spacing -0.02em
- **Hero subtitle:** 18px, line-height 1.6, `--text-muted`
- **Section headings:** 32px, weight 800
- **Feature card titles:** 17px, weight 700

## Color Overrides

- **Gradient text:** `linear-gradient(135deg, #2b7cff, #7c3aed)` with `-webkit-background-clip: text`
- **Hero badge:** `rgba(43, 124, 255, 0.15)` bg, `rgba(43, 124, 255, 0.3)` border
- **Success state:** `rgba(76, 175, 80, 0.2)` bg with `#4CAF50` text
- **Featured pricing card:** accent border + `box-shadow: 0 0 40px rgba(43, 124, 255, 0.1)`

## Button Overrides

- **Primary:** 14px 28px padding, 15px font, border-radius 10px
- **Ghost:** transparent bg, 1px border `--border`, 14px 28px padding
- **Nav CTA (sm):** 10px 16px padding, min-height 44px, 13px font
- **Outline (pricing):** full-width, 12px 24px padding

## Component Overrides

- **Feature cards:** 28px padding, hover = border-color accent + box-shadow glow
- **Pricing cards:** 32px padding, 3-column grid (1-col mobile at 768px)
- **How It Works:** 3-column grid with step numbers (48px, weight 900, 15% opacity accent)

## Responsive (768px breakpoint)

- Nav links hidden (except CTA)
- Hero padding reduced to 48px 20px 40px
- Feature/pricing/steps grids collapse to 1 column
- CTA form stacks vertically
- Footer stacks centered

## Recommendations

- Smooth scroll reveal on sections
- CTA in nav (sticky) + bottom of page
- Social proof: stats bar below hero
- No parallax (performance on mobile)
