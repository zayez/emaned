import type { Specimen } from './types';

export type Rng = () => number;

export function pickOne(pool: Specimen[], rng: Rng = Math.random): Specimen | null {
  if (!pool.length) return null;
  const i = Math.floor(rng() * pool.length);
  const bounded = Math.min(Math.max(i, 0), pool.length - 1);
  return pool[bounded];
}
