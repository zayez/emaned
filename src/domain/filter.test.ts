import { describe, it, expect } from 'vitest';
import { filterPool, poolFor, totalFor } from './filter';
import { getAllPool, getCategoryPool } from './corpus';
import type { FilterState } from './types';

const EMPTY: FilterState = { era: null, vibes: [], maxSyl: null };

describe('filter', () => {
  it('empty filters on `all` returns the full corpus', () => {
    expect(filterPool('all', EMPTY).length).toBe(getAllPool().length);
  });

  it('empty filters on a category returns that category', () => {
    const intel = getCategoryPool('intel');
    expect(filterPool('intel', EMPTY).length).toBe(intel.length);
  });

  it('era is exact-match', () => {
    const modern = filterPool('all', { ...EMPTY, era: 'modern' });
    expect(modern.length).toBeGreaterThan(0);
    for (const w of modern) expect(w.era).toBe('modern');
  });

  it('era null ignores era', () => {
    const eras = new Set(filterPool('all', EMPTY).map((w) => w.era));
    expect(eras.size).toBeGreaterThan(1);
  });

  it('vibes filter is OR across selected tags', () => {
    const out = filterPool('all', { ...EMPTY, vibes: ['ominous', 'aggressive'] });
    expect(out.length).toBeGreaterThan(0);
    for (const w of out) {
      expect(
        w.vibes.includes('ominous') || w.vibes.includes('aggressive'),
      ).toBe(true);
    }
  });

  it('vibes filter with empty array returns everything', () => {
    expect(filterPool('all', { ...EMPTY, vibes: [] }).length).toBe(
      getAllPool().length,
    );
  });

  it('maxSyl is a ceiling', () => {
    const out = filterPool('all', { ...EMPTY, maxSyl: 3 });
    expect(out.length).toBeGreaterThan(0);
    for (const w of out) expect(w.syl).toBeLessThanOrEqual(3);
  });

  it('maxSyl null ignores syllable count', () => {
    const syls = new Set(filterPool('all', EMPTY).map((w) => w.syl));
    expect(Math.max(...syls)).toBeGreaterThan(3);
  });

  it('combined filters compose', () => {
    const out = filterPool('celestial', {
      era: 'classical',
      vibes: ['luminous'],
      maxSyl: 3,
    });
    for (const w of out) {
      expect(w.era).toBe('classical');
      expect(w.vibes.includes('luminous')).toBe(true);
      expect(w.syl).toBeLessThanOrEqual(3);
      expect(w._cat).toBe('celestial');
    }
  });

  it('impossible combination returns empty pool', () => {
    const out = filterPool('intel', { era: 'timeless', vibes: [], maxSyl: null });
    expect(out).toEqual([]);
  });

  it('poolFor/totalFor track the corpus snapshot', () => {
    expect(poolFor('all')).toBe(getAllPool());
    expect(totalFor('all')).toBe(getAllPool().length);
    expect(totalFor('intel')).toBe(getCategoryPool('intel').length);
  });
});
