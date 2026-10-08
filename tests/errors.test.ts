import { describe, expect, it } from "vitest";
import { calculateSheet } from "../src/lib/calculate";
import { fixName } from "../src/lib/rename";
import { editDistance, suggestName } from "../src/lib/suggest";

describe("did you mean (prd.md > Errors and Fixes)", () => {
  it("measures spelling differences", () => {
    expect(editDistance("pric", "price")).toBe(1);
    expect(editDistance("prcie", "price")).toBe(2);
    expect(editDistance("tax", "price")).toBeGreaterThan(2);
  });

  it("suggests the closest name, or nothing if none is close", () => {
    expect(suggestName("pric", ["price", "total"])).toBe("price");
    expect(suggestName("Price", ["price"])).toBe("price");
    expect(suggestName("banana", ["price", "total"])).toBeUndefined();
  });

  it("pric + 5 under price explains and suggests price", () => {
    const [, typo] = calculateSheet("price = 20% off 80\npric + 5");
    expect(typo.error).toBe("I don't know pric.");
    expect(typo.suggestion).toBe("price");
  });

  it("suggests lineN names too", () => {
    expect(calculateSheet("10\nlin1 * 2")[1].suggestion).toBe("line1");
  });

  it("the fix corrects only that line, and the answer appears", () => {
    const text = "price = 20% off 80\npric + 5\npricey = 1";
    const fixed = fixName(text, 2, "pric", "price");
    expect(fixed).toBe("price = 20% off 80\nprice + 5\npricey = 1");
    expect(calculateSheet(fixed)[1].display).toBe("69");
  });

  it("a broken line doesn't stop the others", () => {
    const results = calculateSheet("2 +\n3 * 3");
    expect(results[0].error).toBeDefined();
    expect(results[1].display).toBe("9");
  });
});
