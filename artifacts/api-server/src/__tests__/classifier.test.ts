import { describe, it, expect } from "@jest/globals";
import { classifyBusiness } from "../services/permitData";

describe("classifyBusiness", () => {
  it.each([
    ["I bake cakes and cookies from my kitchen", "food"],
    ["I sell tamales on weekends", "food"],
    ["I do nails and lash extensions", "beauty"],
    ["I clean houses and apartments", "cleaning"],
    ["I mow lawns in my neighborhood", "landscaping"],
    ["I sew dresses for clients", "apparel"],
    ["I tutor kids in math", "education"],
    ["I'm a handyman, I fix leaky pipes", "repair"],
    ["I resell sneakers online", "retail"],
  ])("classifies %j as %s", (message: string, expected: string) => {
    expect(classifyBusiness(message)).toBe(expected);
  });

  it("is case-insensitive", () => {
    expect(classifyBusiness("I BAKE CAKES")).toBe("food");
  });

  it("returns 'general' when nothing matches", () => {
    expect(classifyBusiness("hello there")).toBe("general");
    expect(classifyBusiness("")).toBe("general");
  });

  // Words hidden inside other words
  it("does not read 'street' as landscaping (contains 'tree')", () => {
    expect(classifyBusiness("I sell jewelry on the street")).toBe("retail");
  });

  it("does not read 'address' as apparel (contains 'dress')", () => {
    expect(classifyBusiness("I need help with my business address")).toBe("general");
  });

  it("does not read 'pajamas' as food (contains 'jam')", () => {
    expect(classifyBusiness("I sell pajamas")).toBe("retail");
  });
});