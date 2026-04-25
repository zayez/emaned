import { scrapeIntel } from './intel';
import { scrapeMountains } from './mountains';
import { scrapeCelestial } from './celestial';
import { scrapeGemstones } from './gemstones';
import { scrapeGreek } from './greek';

type ScraperKey = 'intel' | 'mountains' | 'celestial' | 'gemstones' | 'greek';

const SCRAPERS: Record<ScraperKey, () => Promise<unknown>> = {
  intel: scrapeIntel,
  mountains: scrapeMountains,
  celestial: scrapeCelestial,
  gemstones: scrapeGemstones,
  greek: scrapeGreek,
};

function usage(): never {
  console.error('Usage: npm run scrape -- <category>');
  console.error('       npm run scrape -- --all');
  console.error('Available categories:', Object.keys(SCRAPERS).join(', '));
  process.exit(2);
}

async function main() {
  const arg = process.argv[2];
  if (!arg) usage();

  if (arg === '--all' || arg === '--parallel') {
    const entries = Object.entries(SCRAPERS);
    if (arg === '--parallel') {
      await Promise.all(
        entries.map(async ([name, fn]) => {
          console.log(`[${name}] starting`);
          try {
            await fn();
          } catch (err) {
            console.error(`[${name}] failed:`, (err as Error).message);
          }
        }),
      );
    } else {
      for (const [name, fn] of entries) {
        console.log(`\n--- ${name} ---`);
        await fn();
      }
    }
    return;
  }

  const fn = SCRAPERS[arg as ScraperKey];
  if (!fn) usage();
  await fn();
}

main().catch((err) => {
  console.error('scrape failed:', err);
  process.exit(1);
});
