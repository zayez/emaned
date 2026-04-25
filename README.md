# emaned

> A codename generator for naming projects. Pronounced *eh-MAYNED* — `named` reversed.

`emaned` draws a single evocative word from one of five curated taxonomies — Intel processor codenames, mountains, celestial bodies, gemstones, and Greek mythology — with rich filterable metadata. It's a static, no-backend webapp built as a portfolio piece and a personal tool.

The product reality is simple: pick one word from a curated list with filters applied. The design's job is to make that act feel deliberate, editorial, and typographically loud.

---

## The two halves

This repo contains two independent things, each with its own narrative:

### 1. The webapp · `src/`

A static React + TypeScript single-page app, built with Vite. Mobile-first structure with desktop-amplified typography. No backend, no accounts, no analytics — favorites and history persist in `localStorage`.

Hero interaction: a live-updating *pool counter* recomposes as you toggle filter chips (`756 → 92 → 12`). Filters are the stage; the codename is the act.

### 2. The data pipeline · `scripts/`

A three-stage hybrid pipeline that produces the corpus the app ships:

```
   Wikipedia                 Gemini 3.1                  Auto-promote
  MediaWiki API     →       Flash-Lite + JSON     →     filters & merge
   (factual)               (subjective fields)             (objective rules)
       ↓                          ↓                              ↓
   data/raw/             data/enriched/                    data/final/
                                                       ↓
                                              src/domain/corpus.ts
                                              imports JSON at build time
```

Why hybrid: hand-curating ~1,800 entries with five metadata fields each is too slow; pure-LLM generation hallucinates elevations and process nodes that would embarrass a portfolio piece. Scrape what's factual, enrich what's subjective.

Full pipeline narrative: [`scripts/README.md`](scripts/README.md).

---

## Live corpus

| Category | Entries | Source |
|---|---|---|
| Intel codenames | 648 | Wikipedia *List of Intel codenames* |
| Mountains | 127 | Wikipedia *List of highest mountains on Earth* |
| Celestial bodies | 355 | Brightest stars + IAU constellations + named moons |
| Gemstones | 145 | Wikipedia *Category:Gemstones* |
| Greek mythology | 568 | Wikipedia *Greek gods*, *heroes*, *creatures*, *places* categories |
| **Total** | **1,843** | |

Every entry carries: `word`, `syl` (syllable count, deterministic via the `syllable` package), `len`, `era`, `vibes` (1–3 from a closed set), `origin` (one-sentence factual blurb), plus category-specific fields.

The closed `vibe` set:
`aggressive · elegant · austere · mythic · scientific · luminous · ominous`

That single field does more UX work than any other — being able to ask for an *aggressive mountain* or an *elegant Intel codename* is what makes this a project-naming tool, not a random generator.

---

## Quick start

```bash
# install once
npm install

# run the app in dev
npm run dev

# build for production (static output to dist/)
npm run build

# run the test suite
npm run test

# typecheck the app
npm run typecheck

# typecheck the pipeline (separate config — Node target, not browser)
npm run typecheck:scripts
```

To rebuild the corpus from scratch (requires `GEMINI_API_KEY` in `scripts/.env`):

```bash
npm run scrape -- --parallel       # fetch from Wikipedia, parse, write data/raw/
npm run enrich -- intel            # call Gemini, validate, write data/enriched/
# (repeat for mountains/celestial/gemstones/greek, or run in parallel)
npx tsx scripts/src/promote.ts     # apply objective filters, write data/final/
```

---

## Tech stack

**Frontend**
- [Vite](https://vitejs.dev) + React 18 + TypeScript 5 (strict)
- [Vitest](https://vitest.dev) for the test suite (49 tests across `src/domain/`)
- No CSS framework — bespoke CSS, mobile-first
- Static build deploys anywhere (Vercel / Netlify / Cloudflare Pages / GitHub Pages)

**Pipeline**
- [Valibot](https://valibot.dev) for runtime schema validation (~10× smaller than zod when bundled)
- [`@google/genai`](https://www.npmjs.com/package/@google/genai) — Gemini 3.1 Flash-Lite Preview
- [`cheerio`](https://cheerio.js.org) for HTML parsing on Wikipedia tables
- [`@inquirer/prompts`](https://www.npmjs.com/package/@inquirer/prompts) for the optional review CLI
- [`syllable`](https://www.npmjs.com/package/syllable) — heuristic syllable counter

**Conscious omissions**
- No backend. No database. No accounts. No analytics. No CMS.
- No AI inference at runtime. The LLM only runs *offline*, during corpus building.
- No Tailwind / Radix / chakra / shadcn. The design is bespoke loud-minimal typography.
- No state management library. `useState` and `localStorage` cover all of it.

---

## Project structure

```
emaned/
├── src/                       # the webapp (Vite/React entry)
│   ├── app.tsx                # top-level layout switch (mobile vs desktop)
│   ├── main.tsx               # Vite entry
│   ├── styles.css             # bespoke CSS — mobile-first, desktop-amplified
│   ├── domain/                # business logic, fully unit-tested
│   │   ├── types.ts           # canonical TS interfaces (Specimen variants, etc.)
│   │   ├── corpus.ts          # imports data/final/*.json, exposes pool helpers
│   │   ├── filter.ts          # filter predicate composition
│   │   ├── generate.ts        # weighted random selection
│   │   ├── casing.ts          # ALL CAPS / Title Case / kebab / camel transforms
│   │   ├── persistence.ts     # localStorage helpers for favorites/history
│   │   └── *.test.ts          # 49 unit tests (vitest)
│   ├── components/            # presentational React components
│   ├── desktop/               # desktop layout
│   ├── mobile/                # mobile layout
│   └── hooks/                 # custom hooks (use-emaned, use-keys, use-auto-fit)
├── scripts/                   # the data pipeline (Node, not bundled with app)
│   ├── README.md              # pipeline narrative
│   ├── src/
│   │   ├── schema.ts          # Valibot validators mirroring src/domain/types.ts
│   │   ├── scrape/            # Wikipedia scrapers, one per category
│   │   ├── enrich/            # Gemini client + prompt + response-schema
│   │   ├── review/            # optional interactive curation CLI
│   │   ├── promote.ts         # objective-filter pass: enriched → final
│   │   └── migrate-seed.ts    # one-shot extraction of inline corpus → JSON
│   └── tsconfig.json          # Node target (separate from app's DOM target)
├── data/
│   ├── raw/                   # post-scrape (gitignored — regenerable)
│   ├── enriched/              # post-LLM (gitignored — regenerable)
│   ├── final/                 # ships with app (committed)
│   └── .cache/                # Wikipedia HTML cache (gitignored)
├── docs/
│   └── design-brief.md        # the full design spec for claude-design
├── index.html
├── vite.config.ts
└── tsconfig.json
```

---

## Design philosophy

The full design brief lives at [`docs/design-brief.md`](docs/design-brief.md). Summary of the load-bearing decisions:

- **Loud typography + minimalism.** Typography does the emotional work that illustration and color do elsewhere. The codename always occupies ~40% of viewport at rest.
- **Mobile-first structure, desktop-amplified type.** Mobile is honest and intimate (codename ~96–120pt at 375px). Desktop isn't a linear scale-up — typography becomes deliberately operatic (~280–400pt at 1440px) and whitespace becomes generous beyond utility.
- **Single accent color, monochrome surface.** No category-coded palettes. WCAG 2.2 AA contrast as a hard constraint.
- **Curatorial microcopy.** ALL CAPS mono labels, mixed-case values, no marketing voice, no exclamation marks. One permitted personality flash: empty-state copy.
- **Filter system is the hero UX.** A live pool counter recomposes typographically as you toggle filter chips. The numeral is second only to the codename in visual weight.

---

## License

Code is [MIT](LICENSE) — see `LICENSE` at the repo root.

The Wikipedia-derived corpus in `data/final/` inherits Wikipedia's [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — attribution and share-alike apply if you redistribute the data files.

---

*Built by [Zayez](https://github.com/zayez). Design generated via [Claude](https://claude.ai). Data enriched via Gemini 3.1 Flash-Lite. The narrative reverse-engineered from `named`.*
