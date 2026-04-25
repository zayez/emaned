import { Type } from '@google/genai';
import type { Schema } from '@google/genai';
import type { CategoryId } from '../../../src/domain/types';
import { VIBES, ERAS } from '../../../src/domain/types';

const baseProperties: Record<string, Schema> = {
  era: { type: Type.STRING, enum: [...ERAS] },
  vibes: {
    type: Type.ARRAY,
    items: { type: Type.STRING, enum: [...VIBES] },
    minItems: '1',
    maxItems: '3',
  },
  origin: { type: Type.STRING },
};

const baseRequired = ['era', 'vibes', 'origin'];

export function schemaFor(category: CategoryId): Schema {
  if (category === 'intel') {
    return {
      type: Type.OBJECT,
      properties: {
        ...baseProperties,
        gen: { type: Type.STRING },
      },
      required: [...baseRequired, 'gen'],
      propertyOrdering: ['era', 'vibes', 'origin', 'gen'],
    };
  }
  if (category === 'gemstones') {
    return {
      type: Type.OBJECT,
      properties: {
        ...baseProperties,
        color: { type: Type.STRING },
        rarity: { type: Type.STRING, enum: ['common', 'uncommon', 'rare'] },
      },
      required: [...baseRequired, 'color', 'rarity'],
      propertyOrdering: ['era', 'vibes', 'origin', 'color', 'rarity'],
    };
  }
  return {
    type: Type.OBJECT,
    properties: { ...baseProperties },
    required: [...baseRequired],
    propertyOrdering: ['era', 'vibes', 'origin'],
  };
}
