import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syllable } from 'syllable';
import { enrichOne } from './enrich';
import type { CategoryId } from '../../../src/domain/types';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..');
const RAW_DIR = resolve(REPO_ROOT, 'data/raw');
const ENRICHED_DIR = resolve(REPO_ROOT, 'data/enriched');

type AnyRecord = Record<string, unknown>;

async function fileExists(path: string): Promise<boolean> {
  try { await stat(path); return true; } catch { return false; }
}

async function loadArray(path: string): Promise<AnyRecord[]> {
  if (!(await fileExists(path))) return [];
  const text = await readFile(path, 'utf8');
  return JSON.parse(text) as AnyRecord[];
}

async function saveArray(path: string, data: AnyRecord[]) {
  await mkdir(resolve(path, '..'), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

interface RunOptions {
  category: CategoryId;
  limit?: number;
  /** ms to wait between API calls (Gemini free tier ~15 RPM → 4000). */
  delayMs: number;
}

const DEFAULT_DELAY_MS = 4000;

async function runCategory({ category, limit, delayMs }: RunOptions) {
  const rawPath = resolve(RAW_DIR, `${category}.json`);
  const enrichedPath = resolve(ENRICHED_DIR, `${category}.json`);

  const raw = await loadArray(rawPath);
  if (raw.length === 0) {
    throw new Error(`No raw data at ${rawPath}. Run scrape first.`);
  }

  const existing = await loadArray(enrichedPath);
  const enrichedByWord = new Map<string, AnyRecord>(
    existing.map((e) => [String(e.word).toLowerCase(), e]),
  );

  const todo = raw.filter((r) => !enrichedByWord.has(String(r.word).toLowerCase()));
  const slice = typeof limit === 'number' ? todo.slice(0, limit) : todo;

  console.log(
    `[${category}] raw=${raw.length} already-enriched=${existing.length} to-process=${slice.length}`,
  );

  let okCount = 0;
  let failCount = 0;
  const merged: AnyRecord[] = [...existing];

  for (let idx = 0; idx < slice.length; idx++) {
    const scraped = slice[idx];
    const word = String(scraped.word);
    if (idx > 0 && delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    const result = await enrichOne(category, scraped);

    if (!result.ok || !result.data) {
      console.warn(`  ✗ ${word} — ${result.reason ?? 'unknown'}`);
      failCount++;
      continue;
    }

    const combined: AnyRecord = {
      word,
      syl: syllable(word),
      len: word.length,
      ...scraped,
      ...result.data,
    };
    // Remove scraper-only hints that aren't part of the final schema.
    delete combined.microarch;
    delete combined.process;

    merged.push(combined);
    enrichedByWord.set(word.toLowerCase(), combined);
    okCount++;

    // Persist incrementally so Ctrl-C doesn't lose work.
    await saveArray(enrichedPath, merged);
    process.stdout.write(`  ✓ ${word} (${okCount}/${slice.length})\r`);
  }

  console.log(`\n[${category}] enriched=${okCount} failed=${failCount} total-file=${merged.length}`);
  console.log(`[${category}] → ${enrichedPath}`);
}

function parseArgs(argv: string[]): RunOptions {
  const category = argv[0] as CategoryId | undefined;
  if (!category) {
    console.error('Usage: npm run enrich -- <category> [--limit N] [--delay MS]');
    process.exit(2);
  }
  let limit: number | undefined;
  const limitIdx = argv.indexOf('--limit');
  if (limitIdx >= 0) {
    const n = Number(argv[limitIdx + 1]);
    if (Number.isFinite(n) && n > 0) limit = Math.floor(n);
  }
  let delayMs = DEFAULT_DELAY_MS;
  const delayIdx = argv.indexOf('--delay');
  if (delayIdx >= 0) {
    const n = Number(argv[delayIdx + 1]);
    if (Number.isFinite(n) && n >= 0) delayMs = Math.floor(n);
  }
  return { category, limit, delayMs };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  await runCategory(opts);
}

main().catch((err) => {
  console.error('enrich failed:', err);
  process.exit(1);
});
