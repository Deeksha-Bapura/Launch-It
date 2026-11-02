/**
 * Pulls a JSON object out of a Claude reply and falls back to defaults
 * when the reply is missing, malformed, or wrapped in prose / code fences.
 *
 * Move the inline JSON-parsing logic in services/claudeService.ts into this
 * function, then call it from there. That makes it testable on its own.
 */
export function parseClaudeJson<T extends Record<string, unknown>>(
  raw: string | null | undefined,
  defaults: T,
): T {
  if (!raw || typeof raw !== "string") return { ...defaults };

  // 1. Strip ```json ... ``` fences if present
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = fenced ? fenced[1] : raw;

  // 2. Take the outermost {...} block
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return { ...defaults };

  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ...defaults };
    }
    // 3. Fill any missing keys from defaults
    return { ...defaults, ...parsed } as T;
  } catch {
    return { ...defaults };
  }
}
