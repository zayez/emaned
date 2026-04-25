# `emaned` data pipeline

This folder builds the codename corpus that ships with the webapp. It isn't shipped to end users — it runs locally to produce the JSON files in `data/final/` that the frontend imports.

## Why a pipeline at all

The app's filters are only as rich as the data behind them. Every codename carries shared subjective metadata (`era`, `vibes`, `origin`) plus category-specific facts (`gen` + `year` for Intel, `elev` for mountains, `type` for celestial bodies, `color` + `rarity` for gemstones, `type` for Greek myth). Target corpus size is ~200 entries per category — roughly 1,000 rows with ~5 metadata fields each.

Three tempting shortcuts, all rejected:

| Approach | Problem |
|---|---|
| Hand-curate all 5,000+ cells | Too slow — the project stalls before it ships. |
| Pure LLM generation | Hallucinated elevations, years, and process nodes would embarrass a portfolio piece. |
| Pure Wikipedia scrape | Subjective fields (`vibes`, `era`, `origin`) don't exist as structured data anywhere. |

So: **hybrid.** Scrape what's factual, enrich what's subjective, human-review everything before it hits `data/final/`.

## Pipeline stages

```
      ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
      │   WIKIPEDIA  │   │    GEMINI    │   │    HUMAN     │   │    WEBAPP    │
      │  MediaWiki   │   │ 2.5 Flash +  │   │   REVIEW     │   │  src/domain/ │
      │     API      │   │  responseSchema│   │     CLI      │   │   corpus.ts  │
      └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────────────┘
             │                  │                  │                   ▲
             ▼                  ▼                  ▼                   │
       data/raw/         data/enriched/       data/final/      ────────┘
       word + facts      + era, vibes,        approved set
                          origin, etc.        (ships with app)
```

Each stage is idempotent and resumable. Kill a run mid-way, restart, and it picks up from where it stopped — raw scrapes are cached on disk, enriched entries are written incrementally, and review progress is tracked in `data/review-state.json`.

## Directory layout

```
scripts/
├── src/
│   ├── schema.ts                    # Valibot validators mirroring src/domain/types.ts
│   ├── scrape/
│   │   ├── util.ts                  # MediaWiki API client + on-disk cache
│   │   ├── intel.ts                 # Intel codenames scraper
│   │   └── run.ts                   # Dispatch by category
│   ├── enrich/
│   │   ├── client.ts                # Google GenAI client + env bootstrap
│   │   ├── prompt.ts                # System + user prompt builders (per category)
│   │   ├── response-schema.ts       # Gemini responseSchema per category
│   │   ├── enrich.ts                # Single-word enrichment (API call + parse + validate)
│   │   └── run.ts                   # Orchestrator: iterate raw → call enrich → write enriched
│   └── review/
│       ├── state.ts                 # Load/save data/review-state.json
│       └── cli.ts                   # Interactive approve / edit / reject loop
└── tsconfig.json                    # Node-target (separate from app's DOM-target tsconfig)
```

Data produced:

```
data/
├── .cache/                          # raw Wikipedia HTML responses
├── raw/<category>.json              # factual fields only
├── enriched/<category>.json         # + LLM-enriched subjective fields
├── final/<category>.json            # human-approved, imported by the webapp
└── review-state.json                # rejection tracking, enables resume
```

Only `data/final/*.json` is committed. Raw and enriched files are gitignored — they're intermediate artifacts.

## How to run

Prerequisites:
- Node 20+
- A Gemini API key in `scripts/.env` (copy `.env.example`, drop in `GEMINI_API_KEY=...`).

```bash
# 1. Scrape factual data (cached after first run)
npm run scrape -- intel

# 2. Enrich with Gemini 2.5 Flash. --limit N for a smoke test.
npm run enrich -- intel --limit 5          # 5-word sanity check
npm run enrich -- intel                    # full run

# 3. Review enriched entries interactively
npm run review -- intel

# 4. Typecheck the pipeline separately from the webapp
npm run typecheck:scripts
```

## Technical decisions

**Valibot, not zod.** The pipeline-to-app boundary is runtime JSON, so validation needs to happen somewhere. Valibot's tree-shakable modular API ships ~10× smaller than zod when bundled; since `schema.ts` is also importable from the frontend if we ever want client-side validation, keeping the bundle cost near zero matters.

**Gemini 2.5 Flash with `responseSchema`.** Gemini's JSON mode with a declared `responseSchema` is cleaner than function-calling for fixed-shape output — no tool-use plumbing, no extracting arguments from a message. `thinkingConfig: { thinkingBudget: 0 }` is essential: the 2.5 generation has reasoning tokens on by default, and for constrained short-form output they'd eat the `maxOutputTokens` budget before any JSON is produced. Free-tier rate limit is ~15 RPM, so the orchestrator defaults to a 4-second delay between calls.

**Valibot schemas mirror `src/domain/types.ts`.** The frontend's TypeScript interfaces are the canonical schema. `scripts/src/schema.ts` defines Valibot validators that produce objects structurally compatible with those interfaces — a set of `satisfies`-style compile-time checks at the top of the file fail loudly if they drift.

**Deterministic fields stay out of the LLM.** `len = word.length` is trivial. `syl = syllable(word)` uses the [`syllable`](https://www.npmjs.com/package/syllable) npm package — heuristic but good, and spot-checks against the existing hand-curated seed entries showed identical counts. Asking Gemini to count syllables on top of everything else would add latency and cost with no quality benefit.

**Category-specific contextual fields.** Each category's enrichment schema adds only what it needs: Intel gets a `gen` label drawn from a guided closed-ish set (numbered client generations + `Xeon`/`Atom`/`GPU`/`Chipset`/`—`); gemstones get `color` and `rarity` because Wikipedia doesn't tabulate those cleanly. Everything else (mountains, celestial, Greek) relies on the scraper for its contextual field (`elev`, `type`, `type` respectively).

**Scrape once, cache forever.** MediaWiki API responses land in `data/.cache/` keyed by page title. Re-runs are offline and free. Invalidate by deleting the cache file; the client re-fetches.

## Known gaps

- **Intel scraper misses the Rapids family** (Sapphire/Emerald/Granite Rapids, Sierra Forest, Clearwater Forest) because Wikipedia's "List of Intel codenames" page doesn't index Xeon Scalable lineages. Those entries live on `Xeon_Scalable_Performance_processors` — a fix for v1.1 is a second scrape target for Xeon pages.
- **Celestial / gemstones / Greek scrapers not yet built.** The Intel scraper was the pilot; the enrichment + review flow is category-agnostic and ready for them.
- **No automated refresh.** This is a one-shot curation. Intel releasing a codename in 2027 means manually re-running `scrape` + `enrich` + `review` for the new entry.

## Cost & scale

Gemini 2.5 Flash on the free tier, with rate-limiting at 4s/call and a closed-form system prompt under 2 KB:

| Stage | Time | Cost |
|---|---|---|
| Scrape (all 5 categories, cached) | <1 min | $0 |
| Enrich (~1000 words, 4s delay) | ~70 min | $0 (free tier) |
| Review (~12s/word human attention) | ~12 hours | free-range weekend |

Paid-tier 2.5 Flash would make enrichment drop to ~10 min at ~$1.50 total — meaningful only if the pipeline is re-run frequently. For a one-shot curation it isn't worth it.
