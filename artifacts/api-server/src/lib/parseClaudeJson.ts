/**
 * Pulls a JSON object out of a Claude reply.
 * Handles ```json fences and extra text before/after the object.
 * Returns null if there is no valid JSON object in the reply.
 */
export function extractJson(raw: string | null | undefined): Record<string, any> | null {
  if (!raw || typeof raw !== "string") return null;

  // 1. Strip ```json ... ``` fences if present
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = fenced ? fenced[1] : raw;

  // 2. Take the outermost {...} block
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Same as extractJson, but never fails: missing or broken replies
 * give back the defaults, and missing keys are filled from the defaults.
 */
export function parseClaudeJson<T extends Record<string, unknown>>(
  raw: string | null | undefined,
  defaults: T,
): T {
  const parsed = extractJson(raw);
  return parsed ? ({ ...defaults, ...parsed } as T) : { ...defaults };
}