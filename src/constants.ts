import type { Casing, CategorySelector } from './domain/types';

export interface CategoryChoice {
  id: CategorySelector;
  label: string;
}

export const CATS: readonly CategoryChoice[] = [
  { id: 'all',       label: 'All' },
  { id: 'intel',     label: 'Intel' },
  { id: 'mountains', label: 'Mountains' },
  { id: 'celestial', label: 'Celestial' },
  { id: 'gemstones', label: 'Gemstones' },
  { id: 'greek',     label: 'Greek' },
];

export interface CasingChoice {
  id: Casing;
  label: string;
}

export const CASE_CHOICES: readonly CasingChoice[] = [
  { id: 'upper', label: 'ALL CAPS' },
  { id: 'title', label: 'Title Case' },
  { id: 'kebab', label: 'kebab-case' },
  { id: 'camel', label: 'camelCase' },
];

export const MOBILE_BREAKPOINT = 1100;
