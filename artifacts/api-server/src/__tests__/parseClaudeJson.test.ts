import { describe, it, expect } from "@jest/globals";
import { parseClaudeJson } from "../lib/parseClaudeJson";

const defaults = { title: "Untitled", items: [] as string[] };

describe("parseClaudeJson", () => {
  it("parses a clean JSON reply", () => {
    expect(parseClaudeJson('{"title":"Permit list","items":["a"]}', defaults))
      .toEqual({ title: "Permit list", items: ["a"] });
  });

  it("parses JSON inside ```json fences", () => {
    const raw = 'Here you go:\n```json\n{"title":"Fenced"}\n```';
    expect(parseClaudeJson(raw, defaults).title).toBe("Fenced");
  });

  it("parses JSON surrounded by prose", () => {
    const raw = 'Sure! {"title":"Inline"} Let me know if you need more.';
    expect(parseClaudeJson(raw, defaults).title).toBe("Inline");
  });

  it("fills missing keys from defaults", () => {
    expect(parseClaudeJson('{"title":"Only title"}', defaults).items).toEqual([]);
  });

  it.each([
    ["empty string", ""],
    ["null", null],
    ["undefined", undefined],
    ["no braces", "I can't help with that."],
    ["broken JSON", '{"title": "oops",}'],
    ["truncated JSON", '{"title": "cut off'],
    ["a JSON array", '[1,2,3]'],
  ])("returns defaults for %s", (_label, raw) => {
    expect(parseClaudeJson(raw as string, defaults)).toEqual(defaults);
  });

  it("does not mutate the defaults object", () => {
    const d = { title: "x" };
    parseClaudeJson('{"title":"y"}', d);
    expect(d.title).toBe("x");
  });
});
