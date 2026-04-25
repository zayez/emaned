import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  getAllPool,
  getCategoryPool,
  getTotal,
} from './corpus';
import { CATEGORY_IDS, ERAS, VIBES } from './types';

describe('corpus', () => {
  it('exposes every category from CATEGORY_IDS', () => {
    for (const id of CATEGORY_IDS) {
      expect(getCategoryPool(id).length).toBeGreaterThan(0);
    }
  });

  it('total matches sum of per-category pools', () => {
    const sum = CATEGORY_IDS.reduce((n, id) => n + getCategoryPool(id).length, 0);
    expect(getTotal()).toBe(sum);
    expect(getAllPool().length).toBe(sum);
  });

  it('every specimen tags itself with its category', () => {
    for (const id of CATEGORY_IDS) {
      for (const w of getCategoryPool(id)) {
        expect(w._cat).toBe(id);
      }
    }
  });

  it('every specimen uses era from the closed ERAS set', () => {
    const eras = new Set(ERAS);
    for (const w of getAllPool()) {
      expect(eras.has(w.era)).toBe(true);
    }
  });

  it('every vibe tag is from the closed VIBES set', () => {
    const vibes = new Set(VIBES);
    for (const w of getAllPool()) {
      expect(w.vibes.length).toBeGreaterThan(0);
      expect(w.vibes.length).toBeLessThanOrEqual(3);
      for (const v of w.vibes) expect(vibes.has(v)).toBe(true);
    }
  });

  it('every specimen carries the required base fields', () => {
    for (const w of getAllPool()) {
      expect(typeof w.word).toBe('string');
      expect(w.word.length).toBeGreaterThan(0);
      expect(typeof w.syl).toBe('number');
      expect(w.syl).toBeGreaterThan(0);
      expect(typeof w.len).toBe('number');
      expect(w.len).toBeGreaterThan(0);
      expect(typeof w.origin).toBe('string');
      expect(w.origin.length).toBeGreaterThan(0);
    }
  });

  it('intel specimens have gen and year', () => {
    for (const w of getCategoryPool('intel')) {
      expect('gen' in w && typeof w.gen === 'string').toBe(true);
      expect('year' in w && typeof w.year === 'number').toBe(true);
    }
  });

  it('mountain specimens have elev', () => {
    for (const w of getCategoryPool('mountains')) {
      expect('elev' in w && typeof w.elev === 'number').toBe(true);
    }
  });

  it('celestial specimens have a recognised type', () => {
    const types = new Set(['star', 'moon', 'constellation', 'nebula', 'planet']);
    for (const w of getCategoryPool('celestial')) {
      expect('type' in w && types.has(w.type as string)).toBe(true);
    }
  });

  it('gemstones have color and rarity', () => {
    const rarities = new Set(['common', 'uncommon', 'rare']);
    for (const w of getCategoryPool('gemstones')) {
      expect('color' in w && typeof w.color === 'string').toBe(true);
      expect('rarity' in w && rarities.has(w.rarity as string)).toBe(true);
    }
  });

  it('greek specimens have a recognised type', () => {
    const types = new Set(['god', 'hero', 'creature', 'place']);
    for (const w of getCategoryPool('greek')) {
      expect('type' in w && types.has(w.type as string)).toBe(true);
    }
  });

  it('CATEGORIES descriptor covers every id with an extras key', () => {
    expect(CATEGORIES.map((c) => c.id).sort()).toEqual([...CATEGORY_IDS].sort());
    for (const c of CATEGORIES) {
      expect(['gen', 'elev', 'type', 'color']).toContain(c.extra);
    }
  });
});
