import { describe, it, expect } from 'vitest';
import { formatCase } from './casing';

describe('formatCase', () => {
  describe('single-word input', () => {
    it.each([
      ['upper', 'Annapurna', 'ANNAPURNA'],
      ['title', 'Annapurna', 'Annapurna'],
      ['kebab', 'Annapurna', 'annapurna'],
      ['camel', 'Annapurna', 'annapurna'],
    ] as const)('%s → %s', (mode, input, expected) => {
      expect(formatCase(input, mode)).toBe(expected);
    });
  });

  describe('multi-word input', () => {
    it.each([
      ['upper', 'Sapphire Rapids', 'SAPPHIRE RAPIDS'],
      ['title', 'Sapphire Rapids', 'Sapphire Rapids'],
      ['kebab', 'Sapphire Rapids', 'sapphire-rapids'],
      ['camel', 'Sapphire Rapids', 'sapphireRapids'],
      ['kebab', 'Clearwater Forest', 'clearwater-forest'],
      ['camel', 'Clearwater Forest', 'clearwaterForest'],
    ] as const)('%s → %s', (mode, input, expected) => {
      expect(formatCase(input, mode)).toBe(expected);
    });
  });

  it('camel handles already-lowercase multi-word input', () => {
    expect(formatCase('alder lake', 'camel')).toBe('alderLake');
  });

  it('kebab collapses multiple spaces', () => {
    expect(formatCase('Sapphire   Rapids', 'kebab')).toBe('sapphire-rapids');
  });

  it('title passes the canonical corpus casing through', () => {
    expect(formatCase('Meteor Lake', 'title')).toBe('Meteor Lake');
  });
});
