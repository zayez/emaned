import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CategoryId } from '../../../src/domain/types';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..');
const DATA_DIR = resolve(REPO_ROOT, 'data');
const STATE_PATH = resolve(DATA_DIR, 'review-state.json');

type CategoryState = { rejected: string[] };
type ReviewState = Partial<Record<CategoryId, CategoryState>>;

async function fileExists(path: string): Promise<boolean> {
  try { await stat(path); return true; } catch { return false; }
}

export async function loadState(): Promise<ReviewState> {
  if (!(await fileExists(STATE_PATH))) return {};
  return JSON.parse(await readFile(STATE_PATH, 'utf8')) as ReviewState;
}

export async function saveState(state: ReviewState): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

export function rejectedSet(state: ReviewState, cat: CategoryId): Set<string> {
  const words = state[cat]?.rejected ?? [];
  return new Set(words.map((w) => w.toLowerCase()));
}

export function markRejected(state: ReviewState, cat: CategoryId, word: string): void {
  const cur = state[cat] ?? { rejected: [] };
  if (!cur.rejected.some((w) => w.toLowerCase() === word.toLowerCase())) {
    cur.rejected.push(word);
  }
  state[cat] = cur;
}
