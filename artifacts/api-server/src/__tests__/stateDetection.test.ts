import { describe, it, expect } from "@jest/globals";
import { detectState } from "../services/detectState";

describe("detectState", () => {
  it.each([
    ["I live in Texas", "Texas"],
    ["Austin, TX", "Texas"],
    ["We're in New York", "New York"],
    ["I'm in indiana", "Indiana"],
    ["I live in Arkansas", "Arkansas"],          // not "Kansas"
    ["I'm from West Virginia", "West Virginia"], // not "Virginia"
    ["Bloomington, IN", "Indiana"],              // "IN" still works in an address
  ])("detects %j as %s", (message: string, expected: string) => {
    expect(detectState(message)).toBe(expected);
  });

  it("returns null when no state is mentioned", () => {
    expect(detectState("I sell candles")).toBeNull();
  });

  // Ordinary words that are also state codes
  it("does not read 'in' as Indiana", () => {
    expect(detectState("I am in the kitchen baking")).toBeNull();
  });

  it("does not read 'hi' as Hawaii", () => {
    expect(detectState("hi, I bake cakes")).toBeNull();
  });
});