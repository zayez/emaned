# Design Brief: `emaned`

## 1. Project summary

**`emaned`** is a codename generator web app. Pronunciation: *eh-MAYNED* (`named` reversed). It's a static, no-backend tool that draws a single evocative word from one of five curated taxonomies (Intel processor codenames, mountains, celestial bodies, gemstones/minerals, Greek mythology) with rich filterable metadata, designed to help the author name personal projects and to function as a portfolio showcase for UI/UX craft.

The product reality is simple: **pick one word from a curated list with filters applied.** The design's job is to make that simple act feel deliberate, editorial, and typographically loud.

## 2. Visual register (fixed across all variations)

**Loud typography + minimalism.** Typography does the emotional work that illustration, imagery, and color do elsewhere. The codename itself is always the loudest element on screen.

**Fixed constraints — apply to every variation:**
- The codename occupies roughly 40% of viewport at rest
- Monochrome or near-monochrome surface + at most one accent color
- No illustrations, no photography, no iconography beyond functional UI icons
- No category-coded palettes; one global accent color only
- No gradients as primary surface treatment
- No skeuomorphism of any kind
- No terminal / hacker / matrix / scanline aesthetics
- No slot-machine, card-flip, or literal "spinning wheel" generation metaphors
- Both light and dark modes required; neither is an afterthought

## 3. Three design variations to explore

Each variation must be internally coherent — the typography choice implies a casing, layout, and accent posture that fits it. These are starting points; refine within each direction's spirit if needed.

### Variation A — The contemporary-indie
- **Type:** Wide grotesk display (reference: ABC Diatype, Söhne Breit, GT America)
- **Layout:** Centered stage — codename dead-center, symmetric composition, metadata below
- **Casing:** ALL CAPS codename
- **Accent:** One unexpected electric accent (vivid orange or similar — must pass WCAG AA)

### Variation B — The editorial-curatorial
- **Type:** Editorial display serif with personality (reference: GT Sectra, Canela, Migra, Reckless Neue)
- **Layout:** Asymmetric editorial grid — codename offset, metadata in columned arrangement
- **Casing:** Title Case codename
- **Accent:** Pure monochrome, no color — typography carries 100%

### Variation C — The design-forward expressive
- **Type:** Expressive / character-driven display (reference: ABC Ginto Nord, GT Maru, Migra, Rader)
- **Layout:** Split-screen — codename on one half, metadata on the other
- **Casing:** Lowercase codename
- **Accent:** One restrained accent (muted, sophisticated)

**All three variations must include:** UI / label typography in a monospace (reference: JetBrains Mono, Berkeley Mono, Söhne Mono) at 12–14pt for that deliberate specimen-card texture.

## 4. Responsive strategy (applies to all variations)

**Mobile-first structure. Desktop-amplified typography.** Both viewports are exhibition-quality deliverables; neither is treated as a reduction of the other.

| Viewport | Size | Codename scale | Posture |
|---|---|---|---|
| Mobile | 375 × 812 | 96–120pt | Loud and intimate, structure is reliable |
| Tablet | 1024 × 768 | 180–220pt | Transitional, competent |
| Desktop | 1440 × 900 | 280–400pt | Loud and operatic, deliberately airy, spark joy |

Desktop is not a linear scale-up — the codename grows *disproportionately* and the whitespace becomes generous beyond utility.

## 5. Categories and metadata schema

Five categories, one active at any moment (never simultaneously):

1. **Intel processor codenames** (e.g. Alder Lake, Raptor Lake, Meteor Lake)
2. **Mountains** (e.g. Denali, Kilimanjaro, Annapurna)
3. **Celestial bodies** (e.g. Vega, Cassiopeia, Europa)
4. **Gemstones / minerals** (e.g. Cinnabar, Peridot, Obsidian)
5. **Greek mythology** (e.g. Hecate, Erebus, Atalanta)

**Every word carries shared metadata:** word · syllables · length · era (modern/classical/timeless) · vibe (1–3 tags from a closed set) · origin (1-sentence blurb).

**Closed vibe tag set** (this is the cross-category filter that does the most UX work):
`aggressive · elegant · austere · mythic · scientific · luminous · ominous`

**Plus one category-specific field per active category** (shown on the specimen card and filterable when that category is active):
- Intel → generation + year
- Mountains → elevation
- Celestial → type (star/moon/constellation/nebula/planet)
- Gemstones → color + rarity
- Greek → type (god/hero/creature/place)

## 6. Core UX: filter-forward, pool-aware generation

**The hero interaction is a live-updating pool counter.** As the user toggles filter chips, a numeral on screen recomposes in real time (*"47"* → *"12"* → *"3"*). That numeral is second only to the codename itself in typographic weight.

**Filter dimensions (always present, one active category at a time):**
- Category (5 chips, radio-like — one active)
- Vibe tags (multi-select chips, from the closed 7-tag set)
- Length / syllables (chips or slider)
- Era (3-way chip: modern / classical / timeless)
- One contextual filter that swaps with active category (elevation, type, color, etc.)

## 7. Feature inventory (v1 scope)

**In scope — every variation must accommodate these:**

- Hero codename display + specimen-card metadata
- Generate button
- Filter system (chips, live pool counter, always-visible on desktop / bottom-sheet on mobile)
- Category selector (5 chips, single-active)
- Copy to clipboard (dedicated button + click-the-codename)
- Favorite / star button → persists to localStorage
- Favorites drawer (side-drawer on desktop, full-screen modal on mobile)
- History strip (last 10 codenames, thin horizontal strip below hero on desktop, hidden-behind-icon on mobile)
- Output casing toggle (ALL CAPS / Title Case / kebab-case / camelCase)
- Light/dark mode toggle
- Empty state when filters produce zero pool (pool numeral becomes `0` in accent color)
- Keyboard shortcuts (Space = generate, C = copy, F = favorite, Esc = close panels) — documented via a `?` icon
- About / credits surface (minimal, footer link)

**Out of scope — do not propose:**
- Sign-in, user accounts, avatars, profile UI
- Cross-device sync indicators
- Shared / team favorites
- Custom user-defined wordlists
- Shareable permalinks
- Onboarding tutorial / tooltips
- Prefix toggle (`Project` / `Operation` / `Codename`)

## 8. Generation moment (product semantics, motion varies per variation)

**Fixed behavior across all variations:**
- Previous codename goes to history automatically on regenerate
- Copy and favorite are separate actions (not combined)
- Every regenerate is committed — no "draft" state
- When filters produce zero pool, the generate button disables and the pool numeral becomes `0` in the accent color with a terse copy line

**Motion varies — each variation should propose its own typographic reveal** (e.g. weight sweep, letter stabilization, scale-in, optical-size shift, crossfade). Do not propose slot-machine or card-flip metaphors — the reveal should be *typographic*, not *object-based*.

**Respects `prefers-reduced-motion`** — reduced-motion users get an instant swap with no animation.

## 9. Accessibility (hard constraint, not an afterthought)

**WCAG 2.2 AA compliance is a design constraint.** If an accent color doesn't pass contrast, pick a different accent.

- Accent colors must clear **4.5:1** against the light surface and **3:1** against the dark surface
- Visible focus states on every interactive element — custom, not default browser outlines
- Real buttons / toggles in markup, not divs pretending to be interactive
- `prefers-reduced-motion` honored
- Keyboard navigation for everything, shortcuts documented in-app

## 10. Microcopy voice

**Curatorial + minimal.** No marketing voice, no friendly sentences, no exclamation marks.

- Labels: **ALL CAPS monospace**, single words (`CATEGORY`, `VIBE`, `POOL`, `ERA`)
- Values: **mixed case** (`Mountains`, `Austere`, `47 of 312`)
- No full sentences anywhere except empty-states and the about page
- **One permitted personality flash:** empty-state microcopy. Example for zero-pool: `"no specimens match. loosen a filter."` (lowercase, terse, period, no exclamation)

## 11. Deliverables requested

For **each of the three variations**, produce:
- Desktop hero screen (1440 × 900) — light mode
- Desktop hero screen (1440 × 900) — dark mode
- Mobile hero screen (375 × 812) — light mode
- Mobile hero screen (375 × 812) — dark mode
- Desktop view with favorites drawer open
- Desktop empty-state (zero-pool after filtering)
- One motion study / description of the generation moment specific to that variation
- Typographic spec: exact type families, weights, sizes, tracking, leading

Any variation that compromises on mobile-first, or treats mobile as a reduced desktop, or uses forbidden aesthetics (terminal / skeuomorphic / illustrative / gradient-heavy), should be discarded rather than refined.
