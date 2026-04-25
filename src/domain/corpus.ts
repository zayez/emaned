import type {
  CategoryDescriptor,
  CategoryId,
  CelestialSpecimen,
  GemstoneSpecimen,
  GreekSpecimen,
  IntelSpecimen,
  MountainSpecimen,
  Specimen,
} from './types';

import intelData from '../../data/final/intel.json';
import mountainsData from '../../data/final/mountains.json';
import celestialData from '../../data/final/celestial.json';
import gemstonesData from '../../data/final/gemstones.json';
import greekData from '../../data/final/greek.json';

type RawCorpus = {
  intel: IntelSpecimen[];
  mountains: MountainSpecimen[];
  celestial: CelestialSpecimen[];
  gemstones: GemstoneSpecimen[];
  greek: GreekSpecimen[];
};

const RAW: RawCorpus = {
  intel: intelData as IntelSpecimen[],
  mountains: mountainsData as MountainSpecimen[],
  celestial: celestialData as CelestialSpecimen[],
  gemstones: gemstonesData as GemstoneSpecimen[],
  greek: greekData as GreekSpecimen[],
};

export const CATEGORIES: readonly CategoryDescriptor[] = [
  { id: 'intel',     label: 'Intel',     extra: 'gen'   },
  { id: 'mountains', label: 'Mountains', extra: 'elev'  },
  { id: 'celestial', label: 'Celestial', extra: 'type'  },
  { id: 'gemstones', label: 'Gemstones', extra: 'color' },
  { id: 'greek',     label: 'Greek',     extra: 'type'  },
];

function tag<K extends CategoryId>(cat: K, list: RawCorpus[K]): Specimen[] {
  return list.map((w) => ({ ...w, _cat: cat } as Specimen));
}

const BY_CATEGORY: Record<CategoryId, Specimen[]> = {
  intel:     tag('intel', RAW.intel),
  mountains: tag('mountains', RAW.mountains),
  celestial: tag('celestial', RAW.celestial),
  gemstones: tag('gemstones', RAW.gemstones),
  greek:     tag('greek', RAW.greek),
};

const ALL: Specimen[] = CATEGORY_KEYS().flatMap((id) => BY_CATEGORY[id]);

function CATEGORY_KEYS(): CategoryId[] {
  return (Object.keys(BY_CATEGORY) as CategoryId[]);
}

export function getCategoryPool(cat: CategoryId): Specimen[] {
  return BY_CATEGORY[cat];
}

export function getAllPool(): Specimen[] {
  return ALL;
}

export function getTotal(): number {
  return ALL.length;
}
