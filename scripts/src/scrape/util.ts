import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..');
export const CACHE_DIR = resolve(REPO_ROOT, 'data/.cache');
export const RAW_DIR = resolve(REPO_ROOT, 'data/raw');

const USER_AGENT = 'emaned-codename-pipeline/0.1 (portfolio; contact: zayezuno@protonmail.com)';
const WIKI_API = 'https://en.wikipedia.org/w/api.php';

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export interface FetchWikiOptions {
  /** When true, ignore cache and refetch. */
  refresh?: boolean;
  /** ms to wait before the request (rate-limit etiquette). */
  delay?: number;
}

/**
 * Fetch the rendered HTML of a Wikipedia page via the MediaWiki API,
 * caching the raw response to disk so reruns are free and offline-capable.
 */
export async function fetchWikipediaHtml(
  pageTitle: string,
  opts: FetchWikiOptions = {},
): Promise<string> {
  await ensureDir(CACHE_DIR);
  const safe = pageTitle.replace(/[^\w-]+/g, '_');
  const cachePath = resolve(CACHE_DIR, `${safe}.html`);

  if (!opts.refresh && (await fileExists(cachePath))) {
    return readFile(cachePath, 'utf8');
  }

  if (opts.delay && opts.delay > 0) {
    await new Promise((r) => setTimeout(r, opts.delay));
  }

  const url = new URL(WIKI_API);
  url.searchParams.set('action', 'parse');
  url.searchParams.set('page', pageTitle);
  url.searchParams.set('format', 'json');
  url.searchParams.set('prop', 'text');
  url.searchParams.set('formatversion', '2');
  url.searchParams.set('redirects', 'true');

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`MediaWiki API ${res.status} ${res.statusText} for "${pageTitle}"`);
  }
  const body = (await res.json()) as {
    parse?: { text?: string };
    error?: { info?: string };
  };
  if (body.error) {
    throw new Error(`MediaWiki error for "${pageTitle}": ${body.error.info ?? 'unknown'}`);
  }
  const html = body.parse?.text;
  if (!html) {
    throw new Error(`MediaWiki returned no text for "${pageTitle}"`);
  }
  await writeFile(cachePath, html, 'utf8');
  return html;
}

export interface CategoryMembersOptions extends FetchWikiOptions {
  /** MediaWiki namespace 0 = articles only (filters out subcategories, talk pages, etc.) */
  namespace?: number;
  /** Follow pagination (cmcontinue) until the full list is retrieved. */
  paginate?: boolean;
}

/**
 * List article titles in a MediaWiki category. Useful when the knowledge
 * graph models something as a category (gemstones, Greek gods) rather than
 * a structured list page.
 */
export async function fetchCategoryMembers(
  categoryName: string,
  opts: CategoryMembersOptions = {},
): Promise<string[]> {
  await ensureDir(CACHE_DIR);
  const safe = categoryName.replace(/[^\w-]+/g, '_');
  const cachePath = resolve(CACHE_DIR, `cat_${safe}.json`);

  if (!opts.refresh && (await fileExists(cachePath))) {
    return JSON.parse(await readFile(cachePath, 'utf8')) as string[];
  }

  if (opts.delay && opts.delay > 0) {
    await new Promise((r) => setTimeout(r, opts.delay));
  }

  const titles: string[] = [];
  let cmcontinue: string | undefined;
  do {
    const url = new URL(WIKI_API);
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'categorymembers');
    url.searchParams.set('cmtitle', `Category:${categoryName}`);
    url.searchParams.set('cmlimit', '500');
    url.searchParams.set('cmnamespace', String(opts.namespace ?? 0));
    url.searchParams.set('format', 'json');
    url.searchParams.set('formatversion', '2');
    if (cmcontinue) url.searchParams.set('cmcontinue', cmcontinue);

    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`MediaWiki API ${res.status} for Category:${categoryName}`);
    }
    const body = (await res.json()) as {
      query?: { categorymembers?: Array<{ title?: string }> };
      continue?: { cmcontinue?: string };
    };
    for (const m of body.query?.categorymembers ?? []) {
      if (m.title) titles.push(m.title);
    }
    cmcontinue = opts.paginate ? body.continue?.cmcontinue : undefined;
  } while (cmcontinue);

  await writeFile(cachePath, JSON.stringify(titles, null, 2), 'utf8');
  return titles;
}

export async function writeRaw(category: string, data: unknown): Promise<string> {
  await ensureDir(RAW_DIR);
  const path = resolve(RAW_DIR, `${category}.json`);
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return path;
}

export function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

/** Strip wiki refs like [1], footnotes, and surrounding whitespace. */
export function cleanCell(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\[\d+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract the first 4-digit year in the range [1970, 2100] from free text. */
export function firstYear(text: string): number | null {
  const m = text.match(/(19[7-9]\d|20\d{2}|2100)/);
  if (!m) return null;
  const y = Number.parseInt(m[1], 10);
  if (y < 1970 || y > 2100) return null;
  return y;
}

