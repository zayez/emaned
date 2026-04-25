/**
 * One-off migration: extract the inline RAW corpus from src/domain/corpus.ts
 * into data/final/<category>.json files. Run once when replacing inline mock
 * data with the JSON-imported corpus.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORY_IDS } from '../../src/domain/types';
import { getCategoryPool } from '../../src/domain/corpus';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../..');
const FINAL_DIR = resolve(REPO_ROOT, 'data/final');

async function main() {
  await mkdir(FINAL_DIR, { recursive: true });
  for (const cat of CATEGORY_IDS) {
    const pool = getCategoryPool(cat);
    const stripped = pool.map(({ _cat, ...rest }) => rest);
    const path = resolve(FINAL_DIR, `${cat}.json`);
    await writeFile(path, JSON.stringify(stripped, null, 2) + '\n', 'utf8');
    console.log(`→ ${path} (${stripped.length} entries)`);
  }
}

main().catch((err) => {
  console.error('migrate-seed failed:', err);
  process.exit(1);
});
