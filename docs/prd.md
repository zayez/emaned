# PRD — `emaned` codename generator

## Problem Statement

When starting a personal project, the author needs a single evocative codename and would rather draw one from a curated, filterable wordbank than invent one from scratch or trawl Wikipedia. The act of picking should feel deliberate and editorial — not random, not gamified, not decorated with illustrations or marketing voice. The tool also needs to stand on its own as a portfolio-quality showcase of UI/UX craft, so its visual and interaction register matters as much as the functional outcome.

## Solution

A static, no-backend web app that shows one codename at a time, drawn from a curated pool across five taxonomies (Intel processors, mountains, celestial bodies, gemstones/minerals, Greek mythology), each word carrying rich metadata (syllables, length, era, vibe tags, category-specific fields, origin blurb).

The interaction is filter-forward: the user narrows the pool with chip filters (category, vibe, era, syllable ceiling), watches a live pool counter recompose as filters toggle, and presses a single loud Generate button to draw one pick. Favorites and the last ten picks persist locally. The visual register is Variation A from the design brief — wide grotesk hero typography, centered stage, ALL CAPS default casing, one electric orange accent, light and dark modes as equals, WCAG 2.2 AA. Mobile and desktop are both exhibition-quality; neither is a reduction of the other. Deployed as static files from a Vite build.

## User Stories

1. As a codename-seeker, I want to land on a page that explains what `emaned` is, so that I understand the tool's purpose before I touch anything.
2. As a codename-seeker, I want the landing state to not show a pre-picked specimen, so that the first draw still feels like a deliberate act on my part.
3. As a codename-seeker, I want a single prominent Generate button on the landing state, so that I can start without hunting for the primary action.
4. As a codename-seeker, I want to generate from the combined pool of all categories by default, so that I can browse widely without committing to a taxonomy first.
5. As a codename-seeker, I want to filter to a single category (Intel, Mountains, Celestial, Gemstones, Greek), so that I can constrain the vibe of the draw.
6. As a codename-seeker, I want to toggle any number of vibe tags from a closed seven-tag set, so that I can tune the emotional register of candidate codenames.
7. As a codename-seeker, I want to pick exactly one era (modern, classical, timeless) or none, so that I can constrain temporal feel when it matters.
8. As a codename-seeker, I want to cap the maximum syllable count (or leave it unset), so that I can bias toward short, punchy codenames when I want to.
9. As a codename-seeker, I want a live pool counter that updates as I toggle filters, so that I can feel the narrowing and never generate into an empty space by accident.
10. As a codename-seeker, I want the pool counter to be typographically loud (second only to the codename), so that I register filter consequence at a glance.
11. As a codename-seeker, I want pressing Generate to commit the previous codename to history automatically, so that I can reconsider without an explicit "save to history" step.
12. As a codename-seeker, I want the generation moment to be a typographic reveal (weight sweep / stabilization), not a slot-machine or card-flip, so that the moment feels editorial rather than gamified.
13. As a codename-seeker, I want to see rich metadata on the specimen card (syllables, length, era, vibes, origin blurb, plus one category-specific field), so that I can judge fit beyond the word itself.
14. As a codename-seeker, I want category-specific metadata (generation/year for Intel, elevation for mountains, type for celestial and Greek, color/rarity for gemstones) to surface only when relevant, so that the specimen card stays taxonomy-appropriate.
15. As a codename-seeker, I want to copy the current codename to my clipboard with a dedicated button, so that I can paste it wherever I'm working.
16. As a codename-seeker, I want clicking the hero codename itself to also copy it, so that the obvious gesture works.
17. As a codename-seeker, I want a brief confirmation that the copy succeeded (icon swap, not a toast), so that I know it worked without a marketing-feeling popup.
18. As a codename-seeker, I want to favorite the current codename with a dedicated star button, so that I can set aside candidates I'm considering.
19. As a codename-seeker, I want favorites to persist across reloads and browser sessions on this device, so that my shortlist survives a tab close.
20. As a codename-seeker, I want to open a favorites drawer (side-drawer on desktop, full-screen sheet on mobile), so that I can review my shortlist and unstar entries.
21. As a codename-seeker, I want to see a history strip of the last ten codenames I generated, so that I can re-examine a word I scrolled past too quickly.
22. As a codename-seeker, I want to click a history entry to restore it as the current specimen, so that I can revisit it in full detail.
23. As a codename-seeker, I want to switch the output casing between ALL CAPS, Title Case, kebab-case, and camelCase, so that I can copy the word in the exact form my downstream code wants.
24. As a codename-seeker, I want ALL CAPS to be the default casing, so that the hero typography reads as loud specimen-display by default.
25. As a codename-seeker, I want the casing choice to persist across sessions, so that my preferred casing is remembered.
26. As a codename-seeker, I want a light/dark mode toggle, so that I can match my environment.
27. As a codename-seeker, I want my theme preference to persist across sessions, so that I don't re-pick it every visit.
28. As a codename-seeker, I want neither light nor dark mode to feel like an afterthought, so that I can use either confidently.
29. As a codename-seeker, I want a clear empty state when filters produce a zero-size pool (large `0` in accent color, terse prompt, disabled Generate), so that I know to loosen filters rather than waiting for a draw that won't come.
30. As a codename-seeker, I want a visible "Clear filters" affordance from the empty state, so that one tap gets me back to a draw-able pool.
31. As a keyboard user, I want Space to trigger Generate, so that I can draw rapidly without reaching for the mouse.
32. As a keyboard user, I want C to copy the current codename, F to toggle favorite, and Esc to close overlays, so that high-frequency actions are fast.
33. As a keyboard user, I want `?` to open a shortcuts panel, so that I can discover shortcuts without leaving the page.
34. As a keyboard user, I want shortcuts suppressed while I'm typing in an input, so that shortcut keys don't hijack text entry.
35. As a keyboard user, I want every interactive element to have a visible custom focus ring, so that I can track focus without relying on the default browser outline.
36. As a motion-sensitive user, I want `prefers-reduced-motion` to swap reveals for instant transitions, so that I don't get flashing typographic animation I didn't consent to.
37. As a mobile user, I want the hero codename to fit on one line regardless of the word's length, so that long words like "Clearwater Forest" don't break the composition.
38. As a mobile user, I want filters, history, casing, and about to live behind a bottom nav with icon + label, so that one-thumb operation is reliable.
39. As a mobile user, I want each bottom-nav item to open a bottom sheet with the relevant controls, so that I can narrow filters or review history without leaving the hero view.
40. As a mobile user, I want Generate to remain accessible while I'm adjusting filters, so that I can draw immediately after narrowing the pool.
41. As a mobile user, I want favorites to open as a full-screen overlay (not a side drawer), so that the constrained viewport still gives each favorite room to breathe.
42. As a desktop user, I want the filters always visible in a side rail, so that I can toggle them without opening a panel.
43. As a desktop user, I want the category list in its own rail and the hero codename dead-center, so that the composition reads as a symmetric editorial stage.
44. As a desktop user, I want the hero codename to scale disproportionately larger than on mobile (operatic, not merely bigger), so that desktop whitespace feels generous by design.
45. As a returning user, I want my last-selected category, active filters, casing, history, favorites, and theme to persist, so that I resume the session where I left off.
46. As an accessibility-conscious user, I want the accent color to clear 4.5:1 against the light surface and 3:1 against the dark surface, so that text on accent-colored surfaces meets WCAG AA.
47. As an accessibility-conscious user, I want real semantic buttons and toggles in the markup (not divs with click handlers), so that screen readers and keyboard navigation work out of the box.
48. As a curious user, I want a minimal About surface (origin, specimen count, storage is local) reachable from a footer/nav link, so that I can answer "what is this" without leaving the tool.
49. As the author/operator, I want the corpus, filter logic, casing, generation, and persistence to be implemented as pure, dependency-free modules with a small well-documented interface, so that future corpus edits or behavior tweaks are cheap and safe.
50. As the author/operator, I want unit tests covering each pure module's external behavior, so that I can refactor internals or extend the corpus without regressions.
51. As the author/operator, I want the app to build to plain static assets (HTML, CSS, JS) with no server dependency, so that it deploys to any static host including a plain S3/Pages bucket.
52. As the author/operator, I want the bundle to avoid in-browser Babel/JSX compilation, so that page load is production-grade rather than prototype-grade.

## Implementation Decisions

**Stack.** Vite + React + TypeScript. Output is a static SPA (no SSR, no backend). Deploys as plain static files. Prototype's in-browser Babel-standalone + UMD React approach is discarded — the prototype was a design artifact; the production build uses a real toolchain.

**Visual register.** Variation A from the design brief is the only variation built. B and C are retained in the handoff bundle for archival reference only.

**Deep modules (pure, DOM-free, testable in isolation).**

- **Corpus module.** Owns the five taxonomies and the specimen shape (`word`, `syl`, `len`, `era`, `vibes`, `origin`, plus category-specific fields). Exposes a readonly snapshot of the full corpus and per-category lookups. Shape is the contract; future additions are additive.
- **Filter module.** Pure function: given a category selector (`all` or one of five) and a filter set (`era`, `vibes`, `maxSyl`), returns the filtered specimen list. Handles the `all` aggregation as a first-class case. Matches the brief's filter semantics: era is single-select-or-none, vibes is any-of (OR across selected tags), syllables is a ceiling.
- **Casing module.** Pure function: `(word, mode) → string`, where `mode ∈ {upper, title, kebab, camel}`. Handles multi-word inputs (e.g. "Sapphire Rapids", "Clearwater Forest") correctly for every mode.
- **Generation module.** Pure function: `(pool, previous, rng) → pick`. Accepts an injectable RNG so tests can be deterministic. Draws uniformly from the pool. Returns `null` on empty pool. Does not filter previous out of the pool — brief is fine with the same word re-appearing.
- **Persistence module.** Namespaced localStorage wrapper with JSON serialization and default-value fallback on miss or parse error. Namespace prefix `emaned:`. Silent on quota errors. Keys: `theme`, `page`, `cat`, `era`, `vibes`, `maxSyl`, `casing`, `history`, `favs`.

**DOM-coupled hooks (composed from the pure modules).**

- **App state hook.** Composes corpus + filter + generation + persistence into a single React hook exposing the current specimen, pool, total, filter state, favorites, history, theme, casing, and the action set (generate, toggleVibe, setEra, setMaxSyl, setCat, setCasing, setTheme, toggleFav, isFav, copyCurrent, clearFilters, clearCurrent). History caps at 10 entries with de-duplication by word.
- **Keyboard shortcuts hook.** Binds Space / C / F / Esc / `?`. Suppresses when focus is inside an `INPUT`, `TEXTAREA`, or `contentEditable` element.
- **Auto-fit hook.** Measure-then-scale: renders the hero at target size, measures `scrollWidth` against available width, rescales to fit with a configurable floor. Re-measures on `document.fonts.ready` so the first paint doesn't win against late font load.

**Responsive split.** A single breakpoint at 1100px. Below, mobile composition; at or above, desktop three-column composition (category rail · centered stage · filter rail, with history strip as a footer row). Resize listener swaps implementations live.

**View layer.**

- Shared primitives: Icon set (inline SVG), chip button (three states: idle, `on` monochrome, `accent-on` orange), generate pill (loud, with glow, disabled state when pool is empty), pool block (label + numeral + `of total`, accent-colored numeral on zero).
- Desktop: TopBar, CategoryRail, FilterRail, HomeStage (landing), GeneratorStage (post-first-generate), SpecimenCard, ZeroStage, HistoryStrip, FavoritesDrawer (side), Modal (shortcuts + about).
- Mobile: Header, HomeStage, GeneratorStage (with auto-fit hero), ZeroStage, BottomNav (Filter / History / Case / About, each with icon + label + badge), four bottom-sheet panels, FavoritesModal (full-screen).

**Page state.** Two pages: `home` (landing explainer + single Generate CTA + category shortcuts) and `generator` (specimen view). Default category is `all` on first visit. First Generate press transitions `home → generator`. Page state persists.

**Generation moment.** CSS keyframe animation on the hero: opacity + vertical translate + font-weight sweep + letter-spacing stabilization over ~420ms on a cubic-bezier. No object-based transitions. `prefers-reduced-motion` disables the keyframe entirely.

**Accent color.** Light mode `#ff4d1f`, dark mode `#ff5c2f`. Must be verified against WCAG AA (4.5:1 on light surface, 3:1 on dark). If either fails at build time, the accent is adjusted before ship, not the contrast target.

**Typography.** Archivo variable font (width axis, 125% stretch) for the hero and body. JetBrains Mono for all label-cased metadata and monospace UI. Both loaded from Google Fonts with `preconnect` and `display=swap`.

**Typographic voice.** Labels are ALL CAPS monospace, single words. Values are mixed case. No full sentences except empty-state microcopy and the About page. Zero-pool microcopy is `"no specimens match. loosen a filter."` verbatim.

**Accessibility.** Real `<button>` elements for every interactive affordance. Custom `:focus-visible` outline (accent color, 2px, with offset). Keyboard path covers every action. `prefers-reduced-motion` honored. Semantic landmarks (`<header>`, `<main>`, `<aside>`, `<footer>`) used for the desktop composition.

**Persistence shape.** Corpus is never persisted (it ships with the bundle). Only user state persists: theme, page, category, era, vibes, maxSyl, casing, history (last 10), favorites.

## Testing Decisions

**What makes a good test.** Tests assert on external behavior visible at the module boundary, not on internal structure. A test should still pass after an internal refactor that preserves the interface. Tests avoid snapshotting implementation details and avoid asserting on the shape of intermediate values. For the generation module specifically, tests inject a deterministic RNG rather than asserting on statistical distribution of a real random source.

**Modules under test.** All five pure modules get unit tests:

- **Corpus** — shape is correct; every specimen has the required fields; every vibe tag is from the closed seven-tag set; every era is one of the three; category-specific fields are present where required; total count matches the constant exposed to the UI.
- **Filter** — `all` aggregates across categories; single-category narrows correctly; era filter is exact-match-or-null; vibes filter is OR across selected tags; maxSyl is a ceiling (`syl ≤ maxSyl`); combined filters compose; empty filters return the full pool; empty pool is a valid output.
- **Casing** — all four modes on single-word input; all four modes on multi-word input (the interesting cases: `Sapphire Rapids`, `Clearwater Forest`); mode names and output shapes are contractually stable; Title Case passes through the corpus's canonical form.
- **Generation** — deterministic when RNG is injected; never picks outside the provided pool; returns null (or equivalent sentinel) on empty pool; re-drawing with the same RNG seed is repeatable.
- **Persistence** — round-trips JSON-serializable values; returns default on missing key; returns default on corrupt JSON; namespaces keys correctly so two emaned instances in separate localStorage partitions don't collide; silent on quota errors.

**DOM-coupled hooks (`useEmaned`, `useKeys`, `useAutoFit`) and the view layer are not covered by unit tests in the initial pass.** They can be covered later by integration or component tests if regressions appear. This bound is deliberate: the pure modules carry the logic weight; the hooks and views are thin wiring on top.

**Prior art.** The repo is greenfield, so there is no local prior art. The test runner and assertion style will follow the Vite/TypeScript ecosystem defaults — Vitest for unit tests, colocated with the module under test.

## Out of Scope

From the design brief:
- Sign-in, user accounts, avatars, profile UI
- Cross-device sync or sync indicators
- Shared / team favorites
- User-defined custom wordlists
- Shareable permalinks for a specific codename or filter state
- Onboarding tutorial, coach-marks, tooltips beyond the shortcuts panel
- Prefix toggle (`Project ___` / `Operation ___` / `Codename ___`)

From this PRD:
- Variations B (editorial-curatorial serif) and C (design-forward expressive). The handoff files remain in the design bundle but are not built.
- Server-side rendering, backend API, database. The app is static.
- Analytics, telemetry, error reporting.
- Internationalization. The corpus is English, the UI is English.
- Integration/E2E tests, visual regression tests, and snapshot tests in the initial pass.

## Further Notes

**Prototype is a reference, not a blueprint.** The handoff prototype is a single-file UMD React app with Babel-standalone compiling JSX in the browser. It captures the final design intent after several rounds of iteration (landing state, all-pool default, loud Generate, no syllable default, mobile auto-fit hero, bottom-nav sheets, 1100px breakpoint). The production implementation matches its visual output pixel-perfectly but rebuilds the internals on a proper toolchain with typed modules and tested pure functions.

**Corpus is intentionally small.** Roughly a dozen entries per category, ~60 total. The tool's value is curation, not scale. Corpus growth is a non-event from the code's perspective — the filter and generation modules don't care about size — so adding a specimen is a one-line data edit plus a test assertion update.

**Design brief is authoritative on visual register.** Where the prototype and the design brief disagree, the brief wins. Where they agree, the prototype wins on specific pixel values (font sizes, border colors, exact orange, padding) because those are the artifact the user signed off on.

**Iteration history worth preserving.** The user's mid-design feedback (no pre-picked specimen on landing, generate from all-pool by default, loud Generate, no default syllable cap, mobile hero auto-fit) is baked into Variation A and must survive the rebuild. These are not polish details — each was a correction to an earlier draft.
