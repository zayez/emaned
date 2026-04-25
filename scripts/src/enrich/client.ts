import { GoogleGenAI } from '@google/genai';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..');

// Prefer scripts/.env (pipeline-specific) then fall back to repo-root .env.
config({ path: resolve(REPO_ROOT, 'scripts/.env'), quiet: true });
config({ path: resolve(REPO_ROOT, '.env'), quiet: true });

const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error(
    'GEMINI_API_KEY not set. Copy scripts/.env.example to scripts/.env and fill it in.',
  );
}

export const client = new GoogleGenAI({ apiKey });
export const MODEL = 'gemini-3.1-flash-lite-preview';
