import * as v from 'valibot';
import { client, MODEL } from './client';
import { systemPromptFor, userPromptFor } from './prompt';
import { schemaFor } from './response-schema';
import { ENRICHMENT_SCHEMAS } from '../schema';
import type { CategoryId } from '../../../src/domain/types';

export interface EnrichResult<T> {
  ok: boolean;
  data?: T;
  reason?: string;
}

export async function enrichOne<C extends CategoryId>(
  category: C,
  scraped: Record<string, unknown>,
): Promise<EnrichResult<v.InferOutput<(typeof ENRICHMENT_SCHEMAS)[C]>>> {
  const responseSchema = schemaFor(category);
  const valibotSchema = ENRICHMENT_SCHEMAS[category];

  let response;
  try {
    response = await client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPromptFor(category, scraped) }],
        },
      ],
      config: {
        systemInstruction: systemPromptFor(category),
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.7,
        maxOutputTokens: 1024,
        // Disable reasoning tokens for 2.5-* models — they'd consume the
        // output budget before the JSON response finishes.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
  } catch (err) {
    return { ok: false, reason: `API error: ${(err as Error).message}` };
  }

  const text = response.text;
  if (!text) {
    return { ok: false, reason: 'empty response' };
  }

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(text);
  } catch (err) {
    return { ok: false, reason: `JSON parse: ${(err as Error).message}` };
  }

  const parsed = v.safeParse(valibotSchema, rawJson);
  if (!parsed.success) {
    const issues = parsed.issues
      .map((i) => `${i.path?.map((p) => p.key).join('.') ?? '?'}: ${i.message}`)
      .join('; ');
    return { ok: false, reason: `schema validation: ${issues}` };
  }

  return {
    ok: true,
    data: parsed.output as v.InferOutput<(typeof ENRICHMENT_SCHEMAS)[C]>,
  };
}
