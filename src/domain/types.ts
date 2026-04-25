export const VIBES = [
  'aggressive',
  'elegant',
  'austere',
  'mythic',
  'scientific',
  'luminous',
  'ominous',
] as const;

export type Vibe = (typeof VIBES)[number];

export const ERAS = ['modern', 'classical', 'timeless'] as const;
export type Era = (typeof ERAS)[number];

export const CATEGORY_IDS = [
  'intel',
  'mountains',
  'celestial',
  'gemstones',
  'greek',
] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export type CategorySelector = 'all' | CategoryId;

export const CASINGS = ['upper', 'title', 'kebab', 'camel'] as const;
export type Casing = (typeof CASINGS)[number];

interface SpecimenBase {
  word: string;
  syl: number;
  len: number;
  era: Era;
  vibes: Vibe[];
  origin: string;
}

export interface IntelSpecimen extends SpecimenBase {
  gen: string;
  year: number;
}

export interface MountainSpecimen extends SpecimenBase {
  elev: number;
}

export interface CelestialSpecimen extends SpecimenBase {
  type: 'star' | 'moon' | 'constellation' | 'nebula' | 'planet';
}

export interface GemstoneSpecimen extends SpecimenBase {
  color: string;
  rarity: 'common' | 'uncommon' | 'rare';
}

export interface GreekSpecimen extends SpecimenBase {
  type: 'god' | 'hero' | 'creature' | 'place';
}

export type Specimen =
  | (IntelSpecimen & { _cat: 'intel' })
  | (MountainSpecimen & { _cat: 'mountains' })
  | (CelestialSpecimen & { _cat: 'celestial' })
  | (GemstoneSpecimen & { _cat: 'gemstones' })
  | (GreekSpecimen & { _cat: 'greek' });

export interface FilterState {
  era: Era | null;
  vibes: Vibe[];
  maxSyl: number | null;
}

export interface CategoryDescriptor {
  id: CategoryId;
  label: string;
  extra: 'gen' | 'elev' | 'type' | 'color';
}
