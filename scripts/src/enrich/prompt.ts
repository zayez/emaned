import type { CategoryId } from '../../../src/domain/types';

const SHARED_GUIDANCE = `You enrich a curated codename library. For every word you receive, output structured metadata that will surface in a UI for a codename generator web app.

Output MUST include three shared fields, regardless of category:

era — one of: modern | classical | timeless
  - modern: evokes 20th–21st century industry, science, or contemporary naming
  - classical: evokes antiquity, mythology, pre-industrial civilizations
  - timeless: geological, astronomical, primal — outside any human era

vibes — array of 1 to 3 tags from this closed set:
  [aggressive, elegant, austere, mythic, scientific, luminous, ominous]
  - aggressive: forceful, martial, predatory
  - elegant: refined, graceful, precise beauty
  - austere: stark, severe, spartan
  - mythic: legendary, archetypal, story-bearing
  - scientific: technical, industrial, measured
  - luminous: radiant, bright, glowing
  - ominous: dark, foreboding, threatening
  Pick the 1–3 that most truthfully describe the word. Avoid defaulting to "scientific" for Intel or "mythic" for Greek — differentiate within each category.

origin — one sentence, 10–300 characters. Factual but evocative. No marketing voice. No exclamation marks. Period at end.`;

const INTEL_GUIDANCE = `
For Intel codenames additionally output:
  gen — short label for the Intel platform this codename belongs to. Use:
    • "1".."18" for Intel Core client generations (Golden Cove → "12", Raptor Cove → "13", etc.)
    • "Xeon" for Xeon / Xeon Scalable server platforms
    • "Atom" for Atom SoC families
    • "GPU" for Intel Xe / Arc GPU codenames
    • "Chipset" for motherboard chipsets
    • "—" if truly unclassifiable

Examples:
  Input: word="Alder Lake", year=2021, microarch="Golden Cove", process="Intel 7"
  Output: { "era": "modern", "vibes": ["scientific", "austere"], "origin": "12th-gen Intel Core microarchitecture introduced in 2021 on the Intel 7 process.", "gen": "12" }

  Input: word="Sapphire Rapids", year=2023, microarch="Golden Cove (server)"
  Output: { "era": "modern", "vibes": ["elegant", "scientific"], "origin": "4th-gen Xeon Scalable server platform launched in 2023.", "gen": "Xeon" }

  Input: word="Silvermont", year=2013
  Output: { "era": "modern", "vibes": ["austere", "scientific"], "origin": "Low-power Atom microarchitecture that unified desktop and mobile Atoms in 2013.", "gen": "Atom" }`;

const MOUNTAINS_GUIDANCE = `
Examples:
  Input: word="Denali", elev=6190
  Output: { "era": "timeless", "vibes": ["austere", "mythic"], "origin": "Highest peak in North America, rising 6,190 m above the Alaskan interior." }

  Input: word="Matterhorn", elev=4478
  Output: { "era": "timeless", "vibes": ["austere", "elegant"], "origin": "Iconic pyramidal summit of the Pennine Alps on the Swiss–Italian border." }

  Input: word="Olympus", elev=2917
  Output: { "era": "classical", "vibes": ["mythic", "elegant"], "origin": "Home of the twelve Olympian gods in Greek myth; 2,917 m in northern Greece." }`;

const CELESTIAL_GUIDANCE = `
Examples:
  Input: word="Vega", type="star"
  Output: { "era": "classical", "vibes": ["luminous", "elegant"], "origin": "Brightest star in the constellation Lyra, once the northern pole star." }

  Input: word="Betelgeuse", type="star"
  Output: { "era": "classical", "vibes": ["ominous", "luminous"], "origin": "Red supergiant marking the shoulder of Orion; fated to end in supernova." }

  Input: word="Helix", type="nebula"
  Output: { "era": "modern", "vibes": ["scientific", "luminous"], "origin": "Planetary nebula in Aquarius known as the Eye of God." }`;

const GEMSTONES_GUIDANCE = `
For gemstones additionally output:
  color — short plain-English color (e.g. "red", "green", "violet", "black", "colorless"). Avoid marketing terms.
  rarity — one of: common | uncommon | rare

Examples:
  Input: word="Cinnabar"
  Output: { "era": "classical", "vibes": ["ominous", "elegant"], "origin": "Mercury sulfide ore prized for its deep vermilion hue.", "color": "red", "rarity": "uncommon" }

  Input: word="Larimar"
  Output: { "era": "modern", "vibes": ["elegant", "luminous"], "origin": "Blue pectolite gem found only in the Dominican Republic.", "color": "blue", "rarity": "rare" }

  Input: word="Obsidian"
  Output: { "era": "classical", "vibes": ["ominous", "austere"], "origin": "Volcanic glass with sharp conchoidal fracture, used as edged tools since the stone age.", "color": "black", "rarity": "common" }`;

const GREEK_GUIDANCE = `
Examples:
  Input: word="Hecate", type="god"
  Output: { "era": "classical", "vibes": ["ominous", "mythic"], "origin": "Greek goddess of magic, crossroads, and the night." }

  Input: word="Atalanta", type="hero"
  Output: { "era": "classical", "vibes": ["elegant", "mythic"], "origin": "Swift-footed huntress of Arcadia who outran every suitor but one." }

  Input: word="Chimera", type="creature"
  Output: { "era": "classical", "vibes": ["aggressive", "mythic"], "origin": "Fire-breathing hybrid of lion, goat, and serpent slain by Bellerophon." }`;

const CATEGORY_GUIDANCE: Record<CategoryId, string> = {
  intel: INTEL_GUIDANCE,
  mountains: MOUNTAINS_GUIDANCE,
  celestial: CELESTIAL_GUIDANCE,
  gemstones: GEMSTONES_GUIDANCE,
  greek: GREEK_GUIDANCE,
};

export function systemPromptFor(category: CategoryId): string {
  return `${SHARED_GUIDANCE}\n\n${CATEGORY_GUIDANCE[category]}\n\nReturn your answer as a JSON object matching the provided schema. No prose, no code fences — just the JSON.`;
}

/**
 * Build the per-word user prompt from scraped factual fields.
 * Keep this short and deterministic — it's the part that differs per word.
 */
export function userPromptFor(
  category: CategoryId,
  scraped: Record<string, unknown>,
): string {
  const lines = [`Category: ${category}`];
  for (const [k, vraw] of Object.entries(scraped)) {
    if (vraw === null || vraw === undefined || vraw === '') continue;
    lines.push(`${k}: ${String(vraw)}`);
  }
  lines.push('');
  lines.push('Produce the enriched JSON now.');
  return lines.join('\n');
}
