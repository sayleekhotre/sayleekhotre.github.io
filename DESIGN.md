# DESIGN.md

Design system for Saylee Khotre's portfolio. Direction: **Nocturne** — a
dark, cinematic, quietly futuristic stage. An editorial serif carries the
voice, a mono carries the machinery, and a violet→cyan aurora is the only
colour story. Dark is the default; a warm-paper light theme is one toggle away.

Tokens live in `src/styles/global.css`. Components reference tokens, never raw
values (the only exceptions are the per-theme token blocks themselves).

## Type

| Role    | Family           | Use |
|---------|------------------|-----|
| Display | Instrument Serif | Hero name, section headings, card titles, stats. Weight 400 only; italic for the accent word in each heading. Tracking `-0.02em` → `-0.035em` as size grows. |
| Body    | Inter            | Prose, buttons, UI. 16–17px, line-height 1.6–1.85. |
| Mono    | Space Mono       | Labels, nav, metadata, counters. Uppercase with `+0.06em`–`+0.14em` tracking. |

Loaded from Google Fonts in `Layout.astro`.

Key sizes: hero `clamp(4rem, 12.5vw, 10.5rem)` · section display
`clamp(2.5rem, 5.4vw, 4.4rem)` · contact `clamp(3rem, 8vw, 6.4rem)` · card
title `clamp(1.7rem, 2.8vw, 2.3rem)` · labels `0.72rem`.

## Colour

| Token        | Dark        | Light       | Use |
|--------------|-------------|-------------|-----|
| `--bg`       | `#07070c`   | `#f6f5f1`   | Page |
| `--surface`  | `#0d0d15`   | `#ffffff`   | Cards, tiles |
| `--surface-2`| `#14141e`   | `#efede8`   | Hover surface |
| `--ink`      | `#ededf3`   | `#14141b`   | Primary text |
| `--ink-mid`  | `#9a9aad`   | `#55556a`   | Secondary text |
| `--ink-dim`  | `#5f5f74`   | `#8c8c9e`   | Decorative metadata only (not body text) |
| `--line` / `--line-2` | white 7% / 14% | ink 8% / 16% | Hairlines / emphasis |
| `--violet`   | `#8b7df7`   | `#5f4fd6`   | Accent |
| `--violet-hi`| `#b3a9ff`   | `#4c3dc4`   | Accent text (labels, dates) |
| `--cyan`     | `#4fd8e4`   | `#13899c`   | Aurora end |
| `--orchid`   | `#d98bf5`   | `#a24fc4`   | Aurora middle (headline gradient only) |

Gradients: `--aurora` (violet → orchid → cyan, headline accents, progress bar)
and `--aurora-2` (violet → cyan, buttons, arrows, stats). Gradients are for
**accents only**: one italic word per heading, the primary CTA, active arrows.

## Frames

- **Nav** — floating glass pill, `top: 18px`, max 1080px, `blur(22px) saturate(170%)`,
  sliding active-section indicator.
- **Container** — `min(100% - 2×gutter, 1180px)`, gutter `clamp(20px, 4vw, 40px)`.
- **Sections** — `clamp(96px, 12vw, 160px)` vertical, hairline between.
- **Work card** — double frame: 1px outer (22px radius) that lights up with a
  cursor spotlight, inner surface (21px), inset media (12px radius). First
  card is a full-width feature card.
- **Radii** — 10 / 16 / 22px; every button, chip and tag is a pill; icon buttons are circles.
- **Stats** — 2×2 tiles separated by 1px gaps over `--line`.

## Motion

| Token      | Value | Use |
|------------|-------|-----|
| `--expo`   | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, reveals, curtains |
| `--spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Hover lifts, magnetic return, arrows |
| `--ease`   | `cubic-bezier(0.4, 0, 0.2, 1)` | Colour/opacity state changes |

Choreography (`src/scripts/effects.js`):

1. **Intro curtain** (home, once per session) — 000→100 counter, gradient bar,
   curtain lifts with `clip-path` over 1.1s.
2. **Hero** — name splits into characters rising from blur (45ms stagger),
   surname rises through a line mask, then tag / role / lede / CTAs at 80–100ms steps.
   Role text rotates every 2.6s.
3. **Ambient** — three floating aurora blobs (16–24s), perspective grid floor
   scrolling toward the viewer, orbit rings with satellites, film grain, dot grid.
4. **Scroll** — `.reveal` rises 36px from 6px blur (1–1.1s expo), `data-d`
   sets delay; counters ease-out-expo over 1.8s; top progress bar.
5. **Pointer** (fine pointers only) — dot + lerped ring cursor (grows on links,
   shows "View" on work cards), ambient cursor light, magnetic buttons
   (0.3/0.4 strength), spotlight + ≤6° tilt on work cards.

`prefers-reduced-motion: reduce` skips the intro, tilt, magnet and cursor and
shows everything immediately.

## Rules

1. Accent gradient on one word per heading, never on full paragraphs.
2. Body text never uses `--ink-dim`; keep 4.5:1 in both themes.
3. Case studies are real routes (`/work/<slug>/`), never modals.
4. New motion uses the three easings above.
5. Everything must read fine with JS off (reveal states are gated on `html.js`).
