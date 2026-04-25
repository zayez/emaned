import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { select, input, checkbox, confirm } from '@inquirer/prompts';
import * as v from 'valibot';
import { VIBES, ERAS, type CategoryId, CATEGORY_IDS, type Era, type Vibe } from '../../../src/domain/types';
import { SPECIMEN_SCHEMAS } from '../schema';
import { loadState, markRejected, rejectedSet, saveState } from './state';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..');
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

const DIVIDER = '─'.repeat(60);

function renderSpecimen(cat: CategoryId, spec: AnyRecord): string {
  const word = String(spec.word);
  const lines: string[] = [];
  lines.push('');
  lines.push(DIVIDER);
  lines.push('');
  lines.push(`  ${word.toUpperCase()}`);
  lines.push('');
  lines.push(`  CATEGORY  · ${cat}`);
  lines.push(`  ERA       · ${String(spec.era)}`);
  lines.push(`  VIBE      · ${Array.isArray(spec.vibes) ? spec.vibes.join(' · ') : ''}`);
  lines.push(`  SYL/LEN   · ${spec.syl} / ${spec.len}`);
  if (cat === 'intel') lines.push(`  GEN/YEAR  · ${spec.gen} · ${spec.year}`);
  if (cat === 'mountains') lines.push(`  ELEV      · ${spec.elev} m`);
  if (cat === 'celestial' || cat === 'greek') lines.push(`  TYPE      · ${spec.type}`);
  if (cat === 'gemstones') lines.push(`  COLOR     · ${spec.color}   RARITY · ${spec.rarity}`);
  lines.push(`  ORIGIN    · ${String(spec.origin)}`);
  lines.push('');
  return lines.join('\n');
}

type Action =
  | 'approve'
  | 'edit-vibes'
  | 'edit-origin'
  | 'edit-era'
  | 'edit-intel-gen'
  | 'reject'
  | 'skip'
  | 'quit';

async function promptAction(cat: CategoryId): Promise<Action> {
  const choices: Array<{ name: string; value: Action }> = [
    { name: '[a]pprove  → add to final', value: 'approve' },
    { name: '[v]ibes    → edit vibe tags', value: 'edit-vibes' },
    { name: '[o]rigin   → edit origin blurb', value: 'edit-origin' },
    { name: '[e]ra      → edit era', value: 'edit-era' },
  ];
  if (cat === 'intel') choices.push({ name: '[g]en     → edit gen label', value: 'edit-intel-gen' });
  choices.push({ name: '[r]eject   → never include', value: 'reject' });
  choices.push({ name: '[s]kip     → decide later', value: 'skip' });
  choices.push({ name: '[q]uit     → save & exit', value: 'quit' });
  return select({ message: 'action', choices, loop: false });
}

async function editVibes(current: string[]): Promise<Vibe[]> {
  const picked = await checkbox<Vibe>({
    message: 'pick 1–3 vibes',
    choices: VIBES.map((vName) => ({
      name: vName,
      value: vName,
      checked: current.includes(vName),
    })),
    validate: (items) =>
      items.length < 1 || items.length > 3 ? 'choose 1 to 3' : true,
  });
  return picked;
}

async function editOrigin(current: string): Promise<string> {
  return input({
    message: 'origin (10–300 chars)',
    default: current,
    validate: (s) => (s.length < 10 ? 'too short' : s.length > 300 ? 'too long' : true),
  });
}

async function editEra(current: string): Promise<Era> {
  return select<Era>({
    message: 'era',
    choices: ERAS.map((e) => ({ name: e, value: e })),
    default: (ERAS as readonly string[]).includes(current) ? (current as Era) : 'modern',
  });
}

async function editIntelGen(current: string): Promise<string> {
  return input({
    message: 'gen label (e.g. 12 / Xeon / Atom / GPU / Chipset / —)',
    default: current,
    validate: (s) => (s.length < 1 || s.length > 12 ? '1–12 chars' : true),
  });
}

async function runReview(cat: CategoryId): Promise<void> {
  const enrichedPath = resolve(ENRICHED_DIR, `${cat}.json`);
  const finalPath = resolve(FINAL_DIR, `${cat}.json`);
  const enriched = await loadArray(enrichedPath);
  if (enriched.length === 0) {
    console.error(`No enriched data at ${enrichedPath}. Run enrich first.`);
    process.exit(1);
  }
  const finalArr = await loadArray(finalPath);
  const approvedWords = new Set(finalArr.map((e) => String(e.word).toLowerCase()));
  const state = await loadState();
  const rejected = rejectedSet(state, cat);

  const todo = enriched.filter((e) => {
    const w = String(e.word).toLowerCase();
    return !approvedWords.has(w) && !rejected.has(w);
  });

  console.log(
    `\n[${cat}] enriched=${enriched.length} approved=${finalArr.length} rejected=${rejected.size} to-review=${todo.length}\n`,
  );

  if (todo.length === 0) {
    console.log('Nothing to review. All enriched entries have been decided.');
    return;
  }

  const validator = SPECIMEN_SCHEMAS[cat];

  for (let i = 0; i < todo.length; i++) {
    let entry = { ...todo[i] };
    // Editing happens in-place on this working copy.

    // eslint-disable-next-line no-constant-condition
    while (true) {
      console.log(renderSpecimen(cat, entry));
      console.log(`  ${i + 1} / ${todo.length} remaining in session`);
      const action = await promptAction(cat);

      if (action === 'approve') {
        const parsed = v.safeParse(validator, entry);
        if (!parsed.success) {
          const issues = parsed.issues
            .map((x) => `${x.path?.map((p) => p.key).join('.') ?? '?'}: ${x.message}`)
            .join('; ');
          console.log(`\n  cannot approve — schema validation failed: ${issues}`);
          const edit = await confirm({ message: 'edit instead of approving?', default: true });
          if (edit) continue;
          break;
        }
        finalArr.push(parsed.output as AnyRecord);
        await saveArray(finalPath, finalArr);
        break;
      }

      if (action === 'reject') {
        markRejected(state, cat, String(entry.word));
        await saveState(state);
        break;
      }

      if (action === 'skip') {
        break;
      }

      if (action === 'quit') {
        await saveState(state);
        console.log(
          `\nSession ended. approved=${finalArr.length} rejected=${rejectedSet(state, cat).size}.`,
        );
        return;
      }

      if (action === 'edit-vibes') {
        entry = { ...entry, vibes: await editVibes(entry.vibes as string[] ?? []) };
      } else if (action === 'edit-origin') {
        entry = { ...entry, origin: await editOrigin(String(entry.origin ?? '')) };
      } else if (action === 'edit-era') {
        entry = { ...entry, era: await editEra(String(entry.era ?? 'modern')) };
      } else if (action === 'edit-intel-gen') {
        entry = { ...entry, gen: await editIntelGen(String(entry.gen ?? '—')) };
      }
    }
  }

  console.log(
    `\nSession complete. approved=${finalArr.length} rejected=${rejectedSet(state, cat).size}.`,
  );
}

function parseCategory(arg: string | undefined): CategoryId {
  if (!arg || !(CATEGORY_IDS as readonly string[]).includes(arg)) {
    console.error(`Usage: npm run review -- <category>`);
    console.error(`Available: ${CATEGORY_IDS.join(', ')}`);
    process.exit(2);
  }
  return arg as CategoryId;
}

async function main() {
  const cat = parseCategory(process.argv[2]);
  try {
    await runReview(cat);
  } catch (err) {
    // inquirer throws on Ctrl-C; save gracefully.
    if ((err as Error).name === 'ExitPromptError') {
      console.log('\n(interrupted — progress saved)');
      return;
    }
    throw err;
  }
}

main().catch((err) => {
  console.error('review failed:', err);
  process.exit(1);
});
