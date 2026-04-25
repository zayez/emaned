import { getAllPool, getCategoryPool } from './corpus';
import type { CategorySelector, FilterState, Specimen } from './types';

export function poolFor(category: CategorySelector): Specimen[] {
  return category === 'all' ? getAllPool() : getCategoryPool(category);
}

export function totalFor(category: CategorySelector): number {
  return poolFor(category).length;
}

export function filterPool(
  category: CategorySelector,
  filters: FilterState,
): Specimen[] {
  const base = poolFor(category);
  const { era, vibes, maxSyl } = filters;
  const vibeSet = vibes.length ? new Set(vibes) : null;
  return base.filter((w) => {
    if (era && w.era !== era) return false;
    if (vibeSet && !w.vibes.some((v) => vibeSet.has(v))) return false;
    if (maxSyl != null && w.syl > maxSyl) return false;
    return true;
  });
}
