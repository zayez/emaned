import * as v from 'valibot';
import { ScrapedGemstone } from '../schema';
import { fetchCategoryMembers, writeRaw } from './util';

type G = v.InferOutput<typeof ScrapedGemstone>;

const CATEGORIES = ['Gemstones'];

const BLOCKLIST = new Set([
  'gemstone', 'gemstones', 'mineral', 'minerals',
  'rough', 'cut', 'faceting', 'lapidary', 'crystal', 'crystals',
  'birthstone', 'birthstones',
]);

/** Filter category titles down to plausible single-entity gem names. */
function isGemEntry(title: string): boolean {
  if (!/^[A-Z]/.test(title)) return false;              // must start with caps
  if (title.length < 3 || title.length > 25) return false;
  if (title.includes('(')) return false;                 // disambiguation "Pyrite (rock band)"
  if (/\blist\b|\bindex\b|\bglossary\b/i.test(title)) return false;
  if (/\bmineralog/i.test(title)) return false;          // "Mineralogy of..."
  if (title.split(/\s+/).length > 3) return false;       // more than 3 words: usually an article, not a name
  if (BLOCKLIST.has(title.toLowerCase())) return false;  // category meta-articles
  return true;
}

export async function scrapeGemstones(): Promise<G[]> {
  const seen = new Set<string>();
  const results: G[] = [];
  for (const cat of CATEGORIES) {
    const titles = await fetchCategoryMembers(cat, { paginate: true });
    for (const title of titles) {
      if (!isGemEntry(title)) continue;
      const key = title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const parsed = v.safeParse(ScrapedGemstone, { word: title });
      if (parsed.success) results.push(parsed.output);
    }
  }
  const path = await writeRaw('gemstones', results);
  console.log(`[gemstones] ${results.length} gems → ${path}`);
  return results;
}
