import { describe, expect, it } from "vitest";
import { calculateSheet } from "../src/lib/calculate";

const values = (text: string) => calculateSheet(text).map((r) => r.display ?? r.error);

describe("word operators", () => {
  it("plus, minus, times, divided by", () => {
    expect(values("5 plus 3\n10 minus 4\n6 times 7\n64 divided by 4\n10 times 3 minus 2")).toEqual([
      "8", "6", "42", "16", "28",
    ]);
  });

  it("words inside names are left alone", () => {
    expect(values("surplus = 10\nsurplus plus 1")).toEqual(["10", "11"]);
  });
});

describe("running totals: a line starting with an operator continues from the answer above", () => {
  it("20% off 80, then plus 30 is 94", () => {
    expect(values("20% off 80\nplus 30")).toEqual(["64", "94"]);
  });

  it("symbols work too, and they chain", () => {
    expect(values("100\n+ 30\n* 2\n/ 4\nminus 5\n- 5")).toEqual(["100", "130", "260", "65", "60", "55"]);
  });

  it("skips empty lines to find the answer above", () => {
    expect(values("10\n\nplus 5")).toEqual(["10", "15"]);
  });

  it("plus 10% adds 10% of the answer above", () => {
    expect(values("200\nplus 10%")).toEqual(["200", "220"]);
  });

  it("keeps the currency of the line above", () => {
    expect(values("$80\nplus 5")).toEqual(["$80", "$85"]);
  });

  it("-30 is still a negative number, not a continuation", () => {
    expect(values("10\n-30")).toEqual(["10", "-30"]);
  });

  it("nothing above, or an error above, explains itself", () => {
    expect(values("plus 3")).toEqual(["There's no answer just above to continue from."]);
    expect(values("banana\nplus 3")[1]).toBe("There's no answer just above to continue from.");
  });
});
