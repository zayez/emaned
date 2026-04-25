/**
 * Promote enriched entries to final, applying objective quality filters.
 *
 * Rules (all defensible, no taste calls):
 *   1. Must validate against the canonical SPECIMEN_SCHEMAS for its category.
 *   2. `origin` must be at least 30 characters (drops vague/generic blurbs).
 *   3. Intel-only: drop entries with `gen === "—"` (unclassifiable).
 *
 * Existing entries already in data/final/<cat>.json (the hand-curated seed)
 * are preserved as-is; enriched entries are merged in only if their `word`
 * isn't already present.
 */

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as v from 'valibot';
import { CATEGORY_IDS, type CategoryId } from '../../src/domain/types';
import { SPECIMEN_SCHEMAS } from './schema';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../..');
const ENRICHED_DIR = resolve(REPO_ROOT, 'data/enriched');
const FINAL_DIR = resolve(REPO_ROOT, 'data/final');

type AnyRecord = Record<string, unknown>;

async function fileExists(path: string): Promise<boolean> {
  try { await stat(path); return true; } catch { return false; }
}

async function loadArray(path: string): Promise<AnyRecord[]> {
  if (!(await fileExists(path))) return [];
  return JSON.parse(await readFile(path, 'utf8')) as AnyRecord[];
}

async function saveArray(path: string, data: AnyRecord[]) {
  await mkdir(resolve(path, '..'), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

interface Stats {
  category: CategoryId;
  enrichedTotal: number;
  schemaFailed: number;
  shortOrigin: number;
  intelUnclassified: number;
  alreadyInFinal: number;
  promoted: number;
  finalTotal: number;
}

async function promoteCategory(category: CategoryId): Promise<Stats> {
  const enrichedPath = resolve(ENRICHED_DIR, `${category}.json`);
  const finalPath = resolve(FINAL_DIR, `${category}.json`);

  const enriched = await loadArray(enrichedPath);
  const existing = await loadArray(finalPath);
  const validator = SPECIMEN_SCHEMAS[category];
  const seenWords = new Set(existing.map((e) => String(e.word).toLowerCase()));

  const stats: Stats = {
    category,
    enrichedTotal: enriched.length,
    schemaFailed: 0,
    shortOrigin: 0,
    intelUnclassified: 0,
    alreadyInFinal: 0,
    promoted: 0,
    finalTotal: 0,
  };

  const additions: AnyRecord[] = [];

  for (let entry of enriched) {
    const wordKey = String(entry.word).toLowerCase();

    if (seenWords.has(wordKey)) {
      stats.alreadyInFinal++;
      continue;
    }

    const origin = String(entry.origin ?? '');
    if (origin.length < 30) {
      stats.shortOrigin++;
      continue;
    }

    if (category === 'intel' && String(entry.gen ?? '').trim() === '—') {
      stats.intelUnclassified++;
      continue;
    }

    // Intel codenames are factually all "modern" era (post-1970 computing).
    // Override any LLM-introduced classical/timeless calls.
    if (category === 'intel') {
      entry = { ...entry, era: 'modern' };
    }

    const parsed = v.safeParse(validator, entry);
    if (!parsed.success) {
      stats.schemaFailed++;
      continue;
    }

    additions.push(parsed.output as AnyRecord);
    seenWords.add(wordKey);
    stats.promoted++;
  }

  const merged = [...existing, ...additions];
  await saveArray(finalPath, merged);
  stats.finalTotal = merged.length;
  return stats;
}

function pad(s: string | number, n: number): string {
  return String(s).padStart(n);
}

async function main() {
  const allStats: Stats[] = [];
  for (const cat of CATEGORY_IDS) {
    const stats = await promoteCategory(cat);
    allStats.push(stats);
  }

  console.log('\n  category    enriched  promoted  final  (skipped: schema/short-origin/unclassified/dup-of-seed)');
  console.log('  ─'.repeat(54));
  for (const s of allStats) {
    console.log(
      `  ${s.category.padEnd(11)} ${pad(s.enrichedTotal, 8)} ${pad(s.promoted, 9)} ${pad(s.finalTotal, 6)}    ${pad(s.schemaFailed, 6)} / ${pad(s.shortOrigin, 5)} / ${pad(s.intelUnclassified, 4)} / ${pad(s.alreadyInFinal, 5)}`,
    );
  }
  const totals = allStats.reduce(
    (acc, s) => {
      acc.promoted += s.promoted;
      acc.finalTotal += s.finalTotal;
      return acc;
    },
    { promoted: 0, finalTotal: 0 },
  );
  console.log('  ─'.repeat(54));
  console.log(`  TOTAL                ${pad(totals.promoted, 9)} ${pad(totals.finalTotal, 6)}`);
}

main().catch((err) => {
  console.error('promote failed:', err);
  process.exit(1);
});
