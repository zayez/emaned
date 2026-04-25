import * as cheerio from 'cheerio';
import * as v from 'valibot';
import { ScrapedIntel } from '../schema';
import { cleanCell, fetchWikipediaHtml, firstYear, writeRaw } from './util';

type Intel = v.InferOutput<typeof ScrapedIntel>;

const HEADER_HINTS = {
  codename: ['codename', 'code name', 'code-name', 'project name', 'platform'],
  year: ['date', 'year', 'introduced', 'released', 'launch', 'announced'],
  microarch: ['microarchitecture', 'architecture', 'core', 'μ-arch', 'u-arch'],
  process: ['process', 'fabrication', 'node', 'technology'],
};

function matchHeader(text: string, hints: string[]): boolean {
  const t = text.toLowerCase().trim();
  return hints.some((h) => t.includes(h));
}

/** Walk every wikitable on the page and harvest (codename, year, microarch?, process?) tuples. */
function extractFromHtml(html: string): Intel[] {
  const $ = cheerio.load(html);
  $('style, script').remove();
  const results: Intel[] = [];
  const seen = new Set<string>();

  $('table.wikitable').each((_, tbl) => {
    const $tbl = $(tbl);
    const $headRow = $tbl.find('tr').first();
    const headers = $headRow
      .find('th, td')
      .toArray()
      .map((th) => cleanCell($(th).text()));

    let codenameCol = -1;
    let yearCol = -1;
    let microarchCol = -1;
    let processCol = -1;
    headers.forEach((h, i) => {
      if (codenameCol < 0 && matchHeader(h, HEADER_HINTS.codename)) codenameCol = i;
      if (yearCol < 0 && matchHeader(h, HEADER_HINTS.year)) yearCol = i;
      if (microarchCol < 0 && matchHeader(h, HEADER_HINTS.microarch)) microarchCol = i;
      if (processCol < 0 && matchHeader(h, HEADER_HINTS.process)) processCol = i;
    });

    if (codenameCol < 0 || yearCol < 0) return; // Not a codename table — skip.

    $tbl.find('tr').slice(1).each((__, row) => {
      const cells = $(row).find('td, th').toArray().map((c) => cleanCell($(c).text()));
      const codenameRaw = cells[codenameCol];
      const yearRaw = cells[yearCol];
      if (!codenameRaw || !yearRaw) return;

      // Sometimes a cell has multiple codenames separated by /, split them.
      const candidates = codenameRaw
        .split(/[/,]| or /i)
        .map((s) => s.trim())
        .filter(Boolean);

      for (const raw of candidates) {
        const word = normalizeCodename(raw);
        if (!word) continue;
        const year = firstYear(yearRaw);
        if (year === null) continue;

        const key = word.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const record: Intel = { word, year };
        if (microarchCol >= 0 && cells[microarchCol]) record.microarch = cells[microarchCol];
        if (processCol >= 0 && cells[processCol]) record.process = cells[processCol];

        results.push(record);
      }
    });
  });

  return results;
}

function normalizeCodename(raw: string): string | null {
  // Drop parenthetical notes, references, obvious non-codename strings.
  const stripped = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  if (!stripped) return null;
  // Filter out single lowercase words or pure numbers / acronyms that clearly
  // aren't project codenames. Real Intel codenames are Title Case multi-words
  // or a single evocative noun (e.g. "Silvermont", "Cannonlake").
  if (stripped.length < 3) return null;
  if (/^\d+$/.test(stripped)) return null;
  if (/^[A-Z]{2,}$/.test(stripped)) return null;
  // Reject things that look like CPU SKU IDs (e.g. "Core i7-12700K").
  if (/[0-9]{3,}/.test(stripped)) return null;
  // Reject anything with lowercase-only tokens — codenames are Proper Noun.
  if (!/[A-Z]/.test(stripped)) return null;
  return stripped;
}

export async function scrapeIntel(): Promise<Intel[]> {
  const html = await fetchWikipediaHtml('List_of_Intel_codenames');
  const extracted = extractFromHtml(html);
  const validated: Intel[] = [];
  for (const entry of extracted) {
    const parsed = v.safeParse(ScrapedIntel, entry);
    if (parsed.success) validated.push(parsed.output);
  }
  const path = await writeRaw('intel', validated);
  console.log(`[intel] ${validated.length} codenames → ${path}`);
  return validated;
}
