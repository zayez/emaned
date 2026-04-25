import { describe, it, expect } from 'vitest';
import { pickOne } from './generate';
import { getAllPool, getCategoryPool } from './corpus';
import type { Specimen } from './types';

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

describe('pickOne', () => {
  it('returns null on empty pool', () => {
    expect(pickOne([] as Specimen[], () => 0)).toBeNull();
  });

  it('draws from the provided pool', () => {
    const pool = getCategoryPool('mountains');
    const rng = seeded(42);
    for (let i = 0; i < 20; i++) {
      const pick = pickOne(pool, rng);
      expect(pick).not.toBeNull();
      expect(pool).toContain(pick);
    }
  });

  it('deterministic with a deterministic RNG', () => {
    const pool = getAllPool();
    const a = pickOne(pool, seeded(1));
    const b = pickOne(pool, seeded(1));
    expect(a).toBe(b);
  });

  it('different seeds diverge', () => {
    const pool = getAllPool();
    const picks = new Set<string>();
    for (let seed = 1; seed <= 50; seed++) {
      const p = pickOne(pool, seeded(seed));
      if (p) picks.add(p.word);
    }
    expect(picks.size).toBeGreaterThan(1);
  });

  it('rng returning 0.999… never overruns the pool', () => {
    const pool = getCategoryPool('greek');
    const pick = pickOne(pool, () => 0.9999999);
    expect(pool).toContain(pick);
  });

  it('rng returning 0 picks the first element', () => {
    const pool = getCategoryPool('intel');
    expect(pickOne(pool, () => 0)).toBe(pool[0]);
  });
});
