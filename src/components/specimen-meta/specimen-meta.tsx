import type { Specimen } from '../../domain/types';

export type SpecimenRow = readonly [string, string | number];

export function specimenRows(w: Specimen): SpecimenRow[] {
  const base: SpecimenRow[] = [
    ['SYL', w.syl],
    ['LEN', w.len],
    ['ERA', w.era],
    ['VIBE', w.vibes.join(' · ')],
  ];
  switch (w._cat) {
    case 'intel':
      return [...base, ['GEN', w.gen], ['YEAR', w.year]];
    case 'mountains':
      return [...base, ['ELEV', w.elev ? `${w.elev} m` : '—']];
    case 'celestial':
      return [...base, ['TYPE', w.type]];
    case 'gemstones':
      return [...base, ['COLOR', w.color], ['RARITY', w.rarity]];
    case 'greek':
      return [...base, ['TYPE', w.type]];
  }
}
