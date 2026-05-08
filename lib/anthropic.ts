// Single wrapper around the Anthropic SDK. Every prompt module uses these.
// Handles JSON parsing, retries on malformed JSON, and consistent model selection.

import Anthropic from '@anthropic-ai/sdk';
import { env } from './env';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

// Default: Sonnet 4.6 for the high-volume calls. Synthesis bumps to Opus 4.7.
const DEFAULT_MODEL = 'claude-sonnet-4-6';
const SYNTHESIS_MODEL = 'claude-opus-4-7';

export type ClaudeCallOptions = {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt: string;
  userPrompt: string;
};

// --- Plain text call ---

export async function callClaude(opts: ClaudeCallOptions): Promise<string> {
  const response = await client.messages.create({
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.systemPrompt,
    messages: [{ role: 'user', content: opts.userPrompt }],
    // Some models (e.g. Opus 4.7) reject `temperature`; only pass it when set.
    ...(opts.temperature !== undefined && { temperature: opts.temperature }),
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    throw new Error(`Unexpected content block type: ${block.type}`);
  }
  return block.text;
}

// --- JSON call: instructs Claude to return JSON, parses, retries once ---

export async function callClaudeJSON<T>(opts: ClaudeCallOptions): Promise<T> {
  const jsonSystemPrompt = `${opts.systemPrompt}

CRITICAL: Return ONLY valid JSON. No prose, no markdown code fences, no commentary before or after. Your entire response must be parseable as JSON.`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callClaude({ ...opts, systemPrompt: jsonSystemPrompt });
      return parseJSONStrict<T>(raw);
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw new Error(
    `Claude JSON call failed after 2 attempts. Last error: ${lastError?.message}`,
  );
}

// --- JSON parser: strips markdown fences Claude sometimes adds anyway ---

function parseJSONStrict<T>(raw: string): T {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      `Failed to parse JSON response. Raw output: ${raw.slice(0, 500)}`,
    );
  }
}

// --- Synthesis-grade call: routes to Opus for higher-stakes aggregation ---

export async function callClaudeSynthesis<T>(
  opts: ClaudeCallOptions,
): Promise<T> {
  return callClaudeJSON<T>({
    ...opts,
    model: SYNTHESIS_MODEL,
    maxTokens: opts.maxTokens ?? 4096,
  });
}

// --- Model export for README / debugging ---

export const MODELS = {
  default: DEFAULT_MODEL,
  synthesis: SYNTHESIS_MODEL,
} as const;
