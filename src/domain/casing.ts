import type { Casing } from './types';

export function formatCase(word: string, mode: Casing): string {
  switch (mode) {
    case 'upper':
      return word.toUpperCase();
    case 'title':
      return word;
    case 'kebab':
      return word.toLowerCase().replace(/\s+/g, '-');
    case 'camel':
      return word
        .split(/\s+/)
        .map((part, i) =>
          i === 0
            ? part.toLowerCase()
            : part[0].toUpperCase() + part.slice(1).toLowerCase(),
        )
        .join('');
  }
}
