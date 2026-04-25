import { describe, it, expect, beforeEach } from 'vitest';
import { createPersistence, type StorageLike } from './persistence';

function memoryStorage(): StorageLike & { dump(): Record<string, string> } {
  const map = new Map<string, string>();
  return {
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => {
      map.set(k, v);
    },
    dump: () => Object.fromEntries(map),
  };
}

describe('persistence', () => {
  let storage: ReturnType<typeof memoryStorage>;
  let p: ReturnType<typeof createPersistence>;

  beforeEach(() => {
    storage = memoryStorage();
    p = createPersistence(storage);
  });

  it('returns the fallback on missing key', () => {
    expect(p.get('missing', 'default')).toBe('default');
    expect(p.get('missing-list', [] as number[])).toEqual([]);
  });

  it('round-trips primitives', () => {
    p.set('theme', 'dark');
    expect(p.get('theme', 'light')).toBe('dark');

    p.set('n', 42);
    expect(p.get('n', 0)).toBe(42);

    p.set('flag', true);
    expect(p.get('flag', false)).toBe(true);

    p.set<null>('nil', null);
    expect(p.get<null>('nil', null)).toBeNull();
  });

  it('round-trips arrays and objects', () => {
    p.set('vibes', ['ominous', 'mythic']);
    expect(p.get<string[]>('vibes', [])).toEqual(['ominous', 'mythic']);

    p.set('specimen', { word: 'Hecate', syl: 3 });
    expect(p.get('specimen', null)).toEqual({ word: 'Hecate', syl: 3 });
  });

  it('returns fallback when stored value is corrupt JSON', () => {
    storage.setItem('emaned:corrupt', '{not json');
    expect(p.get('corrupt', 'fallback')).toBe('fallback');
  });

  it('namespaces keys with emaned: prefix', () => {
    p.set('cat', 'all');
    expect(storage.dump()['emaned:cat']).toBe(JSON.stringify('all'));
  });

  it('is silent when storage is unavailable', () => {
    const off = createPersistence(null);
    expect(off.get('x', 'default')).toBe('default');
    expect(() => off.set('x', 1)).not.toThrow();
    expect(off.get('x', 'default')).toBe('default');
  });

  it('is silent when setItem throws (quota)', () => {
    const throwing: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    };
    const quota = createPersistence(throwing);
    expect(() => quota.set('x', 1)).not.toThrow();
  });
});
