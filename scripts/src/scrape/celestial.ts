import * as cheerio from 'cheerio';
import * as v from 'valibot';
import { ScrapedCelestial } from '../schema';
import { cleanCell, fetchWikipediaHtml, writeRaw } from './util';

type C = v.InferOutput<typeof ScrapedCelestial>;
type CelestialType = C['type'];

interface Source {
  page: string;
  type: CelestialType;
  nameHints: string[];
}

const SOURCES: Source[] = [
  { page: 'List_of_brightest_stars', type: 'star', nameHints: ['name', 'star'] },
  { page: 'IAU_designated_constellations', type: 'constellation', nameHints: ['constellation', 'name', 'english'] },
  { page: 'List_of_natural_satellites', type: 'moon', nameHints: ['name', 'satellite', 'moon'] },
];

function matchHeader(text: string, hints: string[]): boolean {
  const t = text.toLowerCase().trim();
  return hints.some((h) => t.includes(h));
}

const NAME_REJECT = [
  /\btype\b/i,                // "O-type star", "G-type main-sequence"
  /^satellite[s]? of\b/i,     // "Satellite of Earth", "Satellites of Mars"
  /^moons? of\b/i,            // "Moons of Jupiter"
  /\bconstellation\b/i,       // "Constellation family"
];

function normalizeName(raw: string): string | null {
  // Celestial names often sit beside Greek-letter or Bayer-designation columns,
  // e.g. "α Can Maj (Sirius)". Extract the proper-noun name preferentially.
  const paren = raw.match(/\(([A-Z][^)]+)\)/);
  const candidate = paren ? paren[1] : raw;
  const stripped = candidate
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[α-ωΑ-Ω]/g, '') // drop Greek letters
    .replace(/\s+/g, ' ')
    .split(/[\/,]/)[0]
    .trim();
  if (!stripped) return null;
  if (stripped.length < 3 || stripped.length > 30) return null;
  if (!/^[A-Z]/.test(stripped)) return null;
  if (/^[A-Z]{3,}$/.test(stripped)) return null; // pure acronym like "NGC"
  if (/\d{3,}/.test(stripped)) return null; // catalog number like "M31"
  if (NAME_REJECT.some((rx) => rx.test(stripped))) return null;
  // Drop single generic words that aren't proper-noun celestial bodies.
  if (/^(Moon|Star|Planet|Galaxy|Nebula|Satellite|Constellation|Main|Name|Color)$/i.test(stripped)) return null;
  return stripped;
}

async function extractFrom(source: Source): Promise<C[]> {
  const html = await fetchWikipediaHtml(source.page);
  const $ = cheerio.load(html);
  $('style, script').remove();
  const results: C[] = [];
  const seen = new Set<string>();

  $('table.wikitable').each((_, tbl) => {
    const $tbl = $(tbl);
    const headers = $tbl
      .find('tr')
      .first()
      .find('th, td')
      .toArray()
      .map((th) => cleanCell($(th).text()));

    let nameCol = -1;
    headers.forEach((h, i) => {
      if (nameCol < 0 && matchHeader(h, source.nameHints)) nameCol = i;
    });
    if (nameCol < 0) return;

    $tbl.find('tr').slice(1).each((__, row) => {
      const cells = $(row)
        .find('td, th')
        .toArray()
        .map((c) => cleanCell($(c).text()));
      const raw = cells[nameCol];
      if (!raw) return;
      const word = normalizeName(raw);
      if (!word) return;
      const key = word.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const parsed = v.safeParse(ScrapedCelestial, { word, type: source.type });
      if (parsed.success) results.push(parsed.output);
    });
  });

  return results;
}

export async function scrapeCelestial(): Promise<C[]> {
  const all: C[] = [];
  const seen = new Set<string>();
  for (const source of SOURCES) {
    const batch = await extractFrom(source);
    for (const b of batch) {
      const key = b.word.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      all.push(b);
    }
  }
  const path = await writeRaw('celestial', all);
  console.log(`[celestial] ${all.length} bodies → ${path}`);
  return all;
}
