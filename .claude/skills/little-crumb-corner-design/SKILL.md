---
name: little-crumb-corner-design
description: Use this skill to generate well-branded interfaces and assets for Little Crumb Corner, a Singapore home bakery — either for production or throwaway prototypes, mocks, social posts, packaging copy, etc. Contains essential design guidelines, colors, type, fonts, and tokens.
user-invocable: true
---

Read the `README.md` file in this skill first — it covers brand context, content fundamentals, visual foundations, and iconography. Then explore the other available files:

- `colors_and_type.css` — every design token as CSS vars plus utility classes (`lc-btn`, `lc-card`, `lc-tag`, `lc-eyebrow`, `lc-hero`, …). Import this at the top of any standalone HTML you produce.
- `styles.css` — global entry; `@import`s `colors_and_type.css`.

The logo files, preview cards and website UI kit live in the claude.ai design project (https://claude.ai/design/p/019e2051-b77f-72ab-ad95-c4b4af6a48b8). In this repo the logos are in `assets/`: `logo-lockup-inline.png` (crumb + "little crumb corner" on one line, used in the nav, hero and admin top bar) and `logo-mascot.png` (crumb alone, used in the footer). Never redraw the logo.

**In this repo**, the tokens are mirrored into Tailwind v4 `@theme` blocks in `site/src/index.css` and `admin/src/index.css` — use the utilities (`bg-cream`, `text-cocoa`, `font-display`, `shadow-sm`, …) rather than raw hex values or arbitrary shadows. If a token changes in `colors_and_type.css`, update both `@theme` blocks to match.

If you're creating **visual artifacts** (social mocks, throwaway prototypes, packaging concepts, order email mockups, etc.) — create static HTML files using the tokens from `colors_and_type.css`.

If you're working on **production code**, read the rules here to become an expert in designing with this brand. Stick to: lowercase display, Quicksand + Jost only, no emoji in formal copy, no pure black/white, no gradients on text, warm cocoa-tinted shadows, soft pink + sage palette, generous whitespace.

If the user invokes this skill without other guidance, ask them what they want to build or design (a homepage section? a social post? a packaging label? an order confirmation email?), ask a couple of follow-up questions, and act as an expert designer who outputs HTML artifacts or production code depending on the need.

**Hard rules to never break:**
- Page background is `--cream` (`#FAF6F0`), never pure white.
- Body text is `--cocoa` (`#6B4C3B`), never black.
- Display type is **lowercase**, with em-dashes — like this — for emphasis.
- No emoji in product descriptions, prices, or formal copy.
- No exclamation marks in headlines or buttons.
- No taglines or subtitle lines under headings.
- Buttons are always pill-radius with 0.3em tracked uppercase labels.
- Only two type families: Quicksand + Jost.
