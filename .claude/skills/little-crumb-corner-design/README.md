# Little Crumb Corner — Design System

A small home-bakery brand based in Singapore. Sells small-batch baked goods (cheesecakes, brownies, muffins) for self-collection and islandwide delivery. The brand is **cute, elegant, and minimalist**, built on a pink + sage palette and a display/body pairing (Quicksand + Jost).

This design system contains the foundations needed to design or build any Little Crumb Corner-branded surface — a website, an Instagram post, a packaging label, an order confirmation email.

Imported from the claude.ai design project: https://claude.ai/design/p/019e2051-b77f-72ab-ad95-c4b4af6a48b8 (logo files, preview cards, components and the website UI kit live there).

## Components (in the design project)

- `Button` — pill button, `kind="primary" | "secondary"`
- `Tag` — blush or sage label pill
- `SectionHeader` — eyebrow, lowercase title, sage rule
- `Price` — display-face price in deep-rose, whole dollars drop decimals

## Index (this folder)

```
README.md                ← you are here
SKILL.md                 ← Claude Code skill entry point
colors_and_type.css      ← all design tokens as CSS vars + utility classes
styles.css               ← global entry — @imports colors_and_type.css
```

---

## CONTENT FUNDAMENTALS

The brand voice is a **thoughtful friend who happens to bake**. Confident in craft, never performative. Warm, but not chirpy. The rule of thumb: write the way you'd describe a cake to someone you respect.

### Tone & casing
- **No taglines.** Section headers are eyebrow + title only; don't add subtitle lines under headings.
- **Lowercase** in display copy (`hero`, `h1`, `h2`). It's the warmth lever — never shouty.
- **Sentence case** in body copy. Title Case only for proper nouns ("Singapore", "Saturday").
- **UPPERCASE + 0.3em tracking** is reserved for eyebrows, button labels, and tags. Never body.

### Voice rules
- Short sentences. Use em-dashes for pauses — like this — not parentheses.
- "We" and "our" for the bakery; "you" and "your" for the customer.
- Quietly confident, never apologetic, never overhyped.
- No exclamation marks in headlines, buttons, or formal copy. Used sparingly in social only.

### Examples — product description

> ✓ *A slow-baked cheesecake with a deeply caramelised top and a soft, almost-set centre.*

> ✗ *OMG you guys this cheesecake is literally to die for!!*

### Examples — order confirmation

> ✓ *Your box is in the works. We'll have it ready for collection on Saturday.*

> ✗ *YAY! Order received! We're so excited!*

### Examples — social caption

> ✓ *Sunday's batch — out of the oven and onto the cooling rack.*

> ✗ *Fresh outta the oven babes!! Who wants one?!*

### Microcopy vocabulary
| Use | Not |
|---|---|
| Place an order | Order Now! / BUY NOW |
| Self-collection | Pickup |
| Coming soon | Stay tuned! |
| Sold out | OUT OF STOCK!! |
| Small batch | Limited edition |
| Baked fresh | Made daily |

### Emoji policy
**No emoji** in product descriptions, prices, formal copy, packaging, buttons. Acceptable in social captions but used sparingly and never as bullets. Decorative symbols like `·` (middle dot) and `—` (em-dash) carry that role instead.

---

## VISUAL FOUNDATIONS

### Color
A warm, two-family system — **pink + sage**, grounded by **warm neutrals**. No grey. No pure black. No pure white.

- **Primary (Pinks)** — `blush`, `rose`, `dusty-pink`, `deep-rose`. Used for fills, accents, CTAs, prices.
- **Secondary (Sage)** — `sage-light`, `sage`, `sage-dark`, `pine`. Used for grounding, eyebrows, labels, hover depth.
- **Neutrals (Warm)** — `cream` (page bg), `linen` (card bg), `cocoa` (body text), `espresso` (headlines).

Page background is **always `cream`**, never pure white. Body text is **always `cocoa`**, never black. Section backgrounds alternate `cream → linen → cocoa (rare, dark section) → cream`, ending on `blush` in the footer for warmth. Decorative blush/sage-light **ovals** appear at low opacity in corners — never overlapping content.

### Type
Two families, no more.

- **Quicksand** (display) — rounded, light + regular, matching the hand-lettered logo. All headings and prices.
- **Jost** (body / UI) — light/regular/medium. All paragraphs, buttons, labels, tags.

Headlines are **lowercase** with light letter-spacing. Eyebrows are uppercase Jost-medium with `0.3em` tracking in `sage-dark`. Decorative numerals (`01`, `02`, `03`) sit at `0.4` opacity in Quicksand.

### Spacing & layout
- A `0.25rem`-rooted scale from `space-1` (4px) to `space-12` (96px).
- Reading column maxes out at `580px`; product cards at `460px`; full desktop at `1200px`.
- Generous whitespace is non-negotiable. Negative space is part of the brand.

### Radii
A wide range, from `0.5rem` (input chips) to `2rem` (feature panels) to `9999px` (pills, buttons). Buttons are **always full-pill** (`radius-2xl`). Cards are `radius-lg` (`1.2rem`).

### Shadows
Three steps — `shadow-sm`, `shadow`, `shadow-lg`. **All use a warm cocoa tint** (`rgba(107, 76, 59, 0.05–0.10)`). Never grey, never black. Shadows are soft and diffuse; they're scent, not weight.

### Borders & dividers
Cards optionally take a 1px `linen` border for definition. Section dividers are 60px-wide, 1px-tall sage lines at 40–50% opacity, centered. A `· · ·` motif at `0.5em` letter-spacing also marks section breaks.

### Backgrounds
- **No gradients on text. No gradients on UI surfaces.** Solid colors only.
- Alternating section bands: `cream → linen → cocoa (occasional) → cream`.
- Soft decorative **ovals** (blush, sage-light) in corners at 20–40% opacity.
- No repeating patterns or textures.

### Imagery
Natural daylight, soft shadows, slightly desaturated. **Warm-leaning** — slight pink/peach cast acceptable. Linen tablecloths, cream marble, raw wood backdrops. Top-down or 45° composition. Generous negative space. **Square 1:1** for Instagram, **3:4 portrait** for product cards, **16:9** for hero banners. **No** harsh flash, neon, hands holding food, or stock photography.

### Animation
The brand is quiet. Default motion is **fade + soft ease** (e.g. `ease-out`, 200–300ms). No bounces, no springs, no parallax. Hover transitions are color shifts only. Page transitions cross-fade.

### Hover & press states
- **Buttons:** Hover shifts `cocoa → espresso` (primary) or transparent → `linen` (secondary). No size change.
- **Links:** color shift `cocoa → deep-rose`, no underline change.
- **Cards:** subtle lift via `shadow-sm → shadow`, no scale.
- **Press:** brief darken (~10%) — never shrink or jump.

### Transparency & blur
Used **only** for decorative ovals and section dividers (40–50% opacity sage). No frosted glass. No backdrop-filter. The brand is paper-flat.

### Cards
White (or linen) background, `radius-lg`, `1.4rem` padding, `shadow-sm`, optional 1px `linen` border. Soft, paper-like — never floating.

---

## ICONOGRAPHY

No named icon library. Icons are **inline SVG** — hand-rolled, single-weight, stroke `1.5`, rounded caps and joins, `--cocoa` color, sized 18–22px for UI affordances. Rounded caps echo the soft hand-drawn line of the crumb mark. The set could be swapped 1:1 for Lucide or Phosphor (Light) with no other changes.

**No emoji** in UI, packaging, or formal copy. Decorative typographic marks (`·`, `—`, `· · ·`) carry the role emoji often does elsewhere.

The logo direction is **cutesy but put together**: rounded, hand-lettered, soft. Keep the surrounding layout calm and spacious so the character carries the charm. Never redraw the logo.

Photography is shot, not drawn. Do not introduce hand-rolled SVG illustrations of food, baker hands, ovens, etc. — they fight the photography direction.

---

## DON'TS (Quick reference)

- ❌ Emoji in product descriptions, prices, or formal copy.
- ❌ ALL CAPS body text (eyebrows / button labels only).
- ❌ Pure black (`#000`) or pure white (`#FFF`) for type.
- ❌ Drop shadows on text.
- ❌ More than 2 type families on a page.
- ❌ Exclamation marks in headlines or buttons.
- ❌ Stock cake photography.
- ❌ Gradients on text or surfaces.
- ❌ Hand-drawn SVG food illustrations.
- ❌ Bluish-purple gradients, neon highlights, busy patterns.
