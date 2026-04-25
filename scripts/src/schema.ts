import * as v from 'valibot';
import { VIBES, ERAS, CATEGORY_IDS } from '../../src/domain/types';
import type {
  IntelSpecimen,
  MountainSpecimen,
  CelestialSpecimen,
  GemstoneSpecimen,
  GreekSpecimen,
} from '../../src/domain/types';

export const Vibe = v.picklist(VIBES);
export const Era = v.picklist(ERAS);
export const CategoryId = v.picklist(CATEGORY_IDS);

const baseFields = {
  word: v.pipe(v.string(), v.minLength(1), v.maxLength(40)),
  syl: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12)),
  len: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(40)),
  era: Era,
  vibes: v.pipe(v.array(Vibe), v.minLength(1), v.maxLength(3)),
  origin: v.pipe(v.string(), v.minLength(10), v.maxLength(300)),
};

export const IntelSpecimenSchema = v.object({
  ...baseFields,
  gen: v.pipe(v.string(), v.minLength(1), v.maxLength(12)),
  year: v.pipe(v.number(), v.integer(), v.minValue(1970), v.maxValue(2100)),
});

export const MountainSpecimenSchema = v.object({
  ...baseFields,
  elev: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(9000)),
});

export const CelestialSpecimenSchema = v.object({
  ...baseFields,
  type: v.picklist(['star', 'moon', 'constellation', 'nebula', 'planet'] as const),
});

export const GemstoneSpecimenSchema = v.object({
  ...baseFields,
  color: v.pipe(v.string(), v.minLength(2), v.maxLength(20)),
  rarity: v.picklist(['common', 'uncommon', 'rare'] as const),
});

export const GreekSpecimenSchema = v.object({
  ...baseFields,
  type: v.picklist(['god', 'hero', 'creature', 'place'] as const),
});

// Structural check: valibot schemas must produce objects assignable to the
// canonical TS interfaces. If these lines fail to compile, the schemas and
// src/domain/types.ts have drifted — fix the schema, not the types.
const _intelCheck: IntelSpecimen = {} as v.InferOutput<typeof IntelSpecimenSchema>;
const _mountainCheck: MountainSpecimen = {} as v.InferOutput<typeof MountainSpecimenSchema>;
const _celestialCheck: CelestialSpecimen = {} as v.InferOutput<typeof CelestialSpecimenSchema>;
const _gemstoneCheck: GemstoneSpecimen = {} as v.InferOutput<typeof GemstoneSpecimenSchema>;
const _greekCheck: GreekSpecimen = {} as v.InferOutput<typeof GreekSpecimenSchema>;
void _intelCheck; void _mountainCheck; void _celestialCheck; void _gemstoneCheck; void _greekCheck;

// ---------------------------------------------------------------------------
// Scraped fragments — factual fields only, pre-enrichment.
// ---------------------------------------------------------------------------

export const ScrapedIntel = v.object({
  word: v.pipe(v.string(), v.minLength(1)),
  year: v.pipe(v.number(), v.integer()),
  // Context the scraper captures from the table to help the LLM classify gen:
  microarch: v.optional(v.string()),
  process: v.optional(v.string()),
});
export type ScrapedIntel = v.InferOutput<typeof ScrapedIntel>;

export const ScrapedMountain = v.object({
  word: v.pipe(v.string(), v.minLength(1)),
  elev: v.pipe(v.number(), v.integer(), v.minValue(0)),
});
export type ScrapedMountain = v.InferOutput<typeof ScrapedMountain>;

export const ScrapedCelestial = v.object({
  word: v.pipe(v.string(), v.minLength(1)),
  type: v.picklist(['star', 'moon', 'constellation', 'nebula', 'planet'] as const),
});
export type ScrapedCelestial = v.InferOutput<typeof ScrapedCelestial>;

export const ScrapedGemstone = v.object({
  word: v.pipe(v.string(), v.minLength(1)),
  // color and rarity come from LLM enrichment for gemstones — Wikipedia's
  // prose doesn't tabulate them cleanly.
});
export type ScrapedGemstone = v.InferOutput<typeof ScrapedGemstone>;

export const ScrapedGreek = v.object({
  word: v.pipe(v.string(), v.minLength(1)),
  type: v.picklist(['god', 'hero', 'creature', 'place'] as const),
});
export type ScrapedGreek = v.InferOutput<typeof ScrapedGreek>;

// ---------------------------------------------------------------------------
// Enrichment output — what the LLM produces per-word, per-category.
// ---------------------------------------------------------------------------

const enrichmentBase = {
  era: Era,
  vibes: v.pipe(v.array(Vibe), v.minLength(1), v.maxLength(3)),
  origin: v.pipe(v.string(), v.minLength(10), v.maxLength(300)),
};

export const IntelEnrichment = v.object({
  ...enrichmentBase,
  gen: v.pipe(v.string(), v.minLength(1), v.maxLength(12)),
});
export const MountainEnrichment = v.object({ ...enrichmentBase });
export const CelestialEnrichment = v.object({ ...enrichmentBase });
export const GemstoneEnrichment = v.object({
  ...enrichmentBase,
  color: v.pipe(v.string(), v.minLength(2), v.maxLength(20)),
  rarity: v.picklist(['common', 'uncommon', 'rare'] as const),
});
export const GreekEnrichment = v.object({ ...enrichmentBase });

export type IntelEnrichment = v.InferOutput<typeof IntelEnrichment>;
export type MountainEnrichment = v.InferOutput<typeof MountainEnrichment>;
export type CelestialEnrichment = v.InferOutput<typeof CelestialEnrichment>;
export type GemstoneEnrichment = v.InferOutput<typeof GemstoneEnrichment>;
export type GreekEnrichment = v.InferOutput<typeof GreekEnrichment>;

export const SPECIMEN_SCHEMAS = {
  intel: IntelSpecimenSchema,
  mountains: MountainSpecimenSchema,
  celestial: CelestialSpecimenSchema,
  gemstones: GemstoneSpecimenSchema,
  greek: GreekSpecimenSchema,
} as const;

export const ENRICHMENT_SCHEMAS = {
  intel: IntelEnrichment,
  mountains: MountainEnrichment,
  celestial: CelestialEnrichment,
  gemstones: GemstoneEnrichment,
  greek: GreekEnrichment,
} as const;
