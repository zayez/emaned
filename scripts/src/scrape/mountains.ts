import * as cheerio from 'cheerio';
import * as v from 'valibot';
import { ScrapedMountain } from '../schema';
import { fetchWikipediaHtml, writeRaw } from './util';

function cellText(raw: string): string {
  return raw
    .replace(/\[\d+\]/g, '')
    .replace(/[^\S\n]+/g, ' ') // collapse horizontal whitespace only, keep newlines
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');
}

type M = v.InferOutput<typeof ScrapedMountain>;

const HEADER_HINTS = {
  name: ['mountain', 'peak', 'name', 'summit'],
  elev: ['height', 'elevation', 'metres', 'meters'],
};

function matchHeader(text: string, hints: string[]): boolean {
  const t = text.toLowerCase().trim();
  return hints.some((h) => t.includes(h));
}

function normalizeName(raw: string): string | null {
  // Take the first <br>-separated line as the primary name.
  const primary = raw.split(/[\n\r]/)[0];
  // Defensive splitting: Wikipedia cells can run names together without <br>
  // (styled spans, etc.). Insert word boundaries at:
  //   - lowercase → uppercase transitions  ("MountEverest" → "Mount Everest")
  //   - uppercase → uppercase+lowercase     ("IHidden" → "I Hidden")
  //   - uppercase → uppercase+digit          ("IIK4" → "II K4")
  const spaced = primary
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z]\d)/g, '$1 $2');
  const stripped = spaced
    .replace(/\([^)]*\)/g, '')
    .replace(/\s*\/.*$/, '')
    .split(',')[0]
    .replace(/\s+/g, ' ')
    .trim();
  if (!stripped) return null;
  if (/^\d/.test(stripped)) return null;
  if (!/[A-Za-z]/.test(stripped)) return null;

  // Mountain names are reliably 1–2 tokens. Anything longer came from a
  // concatenated alternates cell; take the first two tokens.
  const tokens = stripped.split(' ');
  const chunk = tokens.slice(0, 2).join(' ');
  if (chunk.length < 2 || chunk.length > 40) return null;
  return chunk;
}

function parseElev(raw: string): number | null {
  // Grab first number (may have commas): "8,848" "8848 m" "8,848.86"
  const m = raw.match(/([\d,]+)(?:\.\d+)?/);
  if (!m) return null;
  const n = Number.parseInt(m[1].replace(/,/g, ''), 10);
  if (!Number.isFinite(n) || n < 1000 || n > 9000) return null;
  return n;
}

function extract(html: string): M[] {
  const $ = cheerio.load(html);
  // Drop inline CSS/JS blocks that cheerio's .text() would otherwise fold in.
  $('style, script').remove();
  // Preserve <br>-separated lines as newlines before .text() flattens them.
  $('br').replaceWith('\n');
  const results: M[] = [];
  const seen = new Set<string>();

  $('table.wikitable').each((_, tbl) => {
    const $tbl = $(tbl);
    const headers = $tbl
      .find('tr')
      .first()
      .find('th, td')
      .toArray()
      .map((th) => cellText($(th).text()));

    let nameCol = -1;
    let elevCol = -1;
    headers.forEach((h, i) => {
      if (nameCol < 0 && matchHeader(h, HEADER_HINTS.name)) nameCol = i;
      if (elevCol < 0 && matchHeader(h, HEADER_HINTS.elev)) elevCol = i;
    });
    if (nameCol < 0 || elevCol < 0) return;

    $tbl.find('tr').slice(1).each((__, row) => {
      const cells = $(row)
        .find('td, th')
        .toArray()
        .map((c) => cellText($(c).text()));
      const nameRaw = cells[nameCol];
      const elevRaw = cells[elevCol];
      if (!nameRaw || !elevRaw) return;

      const word = normalizeName(nameRaw);
      if (!word) return;
      const elev = parseElev(elevRaw);
      if (elev === null) return;

      const key = word.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const parsed = v.safeParse(ScrapedMountain, { word, elev });
      if (parsed.success) results.push(parsed.output);
    });
  });

  return results;
}

export async function scrapeMountains(): Promise<M[]> {
  const html = await fetchWikipediaHtml('List_of_highest_mountains_on_Earth');
  const entries = extract(html);
  const path = await writeRaw('mountains', entries);
  console.log(`[mountains] ${entries.length} peaks → ${path}`);
  return entries;
}
