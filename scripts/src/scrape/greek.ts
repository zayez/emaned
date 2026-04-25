import * as v from 'valibot';
import { ScrapedGreek } from '../schema';
import { fetchCategoryMembers, writeRaw } from './util';

type G = v.InferOutput<typeof ScrapedGreek>;
type GreekType = G['type'];

interface Source {
  category: string;
  type: GreekType;
}

// Category names are the ones used on en.wikipedia.org. Some have "Greek_mythology"
// prefix, others "in_Greek_mythology" suffix — depends on each category's curation.
const SOURCES: Source[] = [
  { category: 'Greek_gods', type: 'god' },
  { category: 'Greek_goddesses', type: 'god' },
  { category: 'Titans_(mythology)', type: 'god' },
  { category: 'Children_of_Zeus', type: 'god' },
  { category: 'Heroes_in_Greek_mythology', type: 'hero' },
  { category: 'Characters_in_Greek_mythology', type: 'hero' },
  { category: 'Greek_legendary_creatures', type: 'creature' },
  { category: 'Monsters_in_Greek_mythology', type: 'creature' },
  { category: 'Places_in_Greek_mythology', type: 'place' },
];

function isMythEntry(title: string): boolean {
  if (!/^[A-Z]/.test(title)) return false;
  if (title.length < 3 || title.length > 25) return false;
  if (title.includes('(')) return false;
  if (/\blist\b|\bindex\b|\bcategory\b|\bmythology of\b/i.test(title)) return false;
  if (/\band\b/i.test(title)) return false;                    // "Agreus and Nomios" — compound pairs
  if (/^(Greek|Mythology|Myths?|Mythological|Titanomachy|Aeolids?|Achaeans?)$/i.test(title)) return false;
  if (title.split(/\s+/).length > 3) return false;
  return true;
}

export async function scrapeGreek(): Promise<G[]> {
  const seen = new Set<string>();
  const results: G[] = [];

  // Accumulate in source order so the first-seen type for a title wins
  // (e.g. "Apollo" shows up in both Greek_gods and Children_of_Zeus — we want 'god').
  for (const source of SOURCES) {
    let titles: string[];
    try {
      titles = await fetchCategoryMembers(source.category, { paginate: true });
    } catch (err) {
      console.warn(`  [greek] ${source.category} skipped: ${(err as Error).message}`);
      continue;
    }
    for (const title of titles) {
      if (!isMythEntry(title)) continue;
      const key = title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const parsed = v.safeParse(ScrapedGreek, { word: title, type: source.type });
      if (parsed.success) results.push(parsed.output);
    }
  }

  const path = await writeRaw('greek', results);
  console.log(`[greek] ${results.length} figures → ${path}`);
  return results;
}
