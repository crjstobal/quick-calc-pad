import { describe, expect, it } from "vitest";
import { calculateSheet } from "../src/lib/calculate";
import { renameLine } from "../src/lib/rename";

const textOf = (r: ReturnType<typeof renameLine>) => ("text" in r ? r.text : r.error);
const values = (text: string) => calculateSheet(text).map((r) => r.display ?? r.error);

describe("renaming a line (prd.md > Line Names and Reuse)", () => {
  it("line1 -> price rewrites the line and every use, answers unchanged", () => {
    const before = "20% off 80\nline1 * 2\n(line1 + line2) / 2";
    const after = textOf(renameLine(before, 1, "price"));
    expect(after).toBe("price = 20% off 80\nprice * 2\n(price + line2) / 2");
    expect(values(after)).toEqual(values(before));
  });

  it("renames a line that already has a name", () => {
    const after = textOf(renameLine("net = 150\nvat = 21% of net\ntotal = net + vat", 1, "amount"));
    expect(after).toBe("amount = 150\nvat = 21% of amount\ntotal = amount + vat");
  });

  it("only replaces whole words", () => {
    const after = textOf(renameLine("10\nline1 * 2\nline12 = 5", 1, "x"));
    expect(after).toBe("x = 10\nx * 2\nline12 = 5");
  });

  it("refuses a name that's already used", () => {
    expect(textOf(renameLine("price = 5\n10", 2, "price"))).toBe('"price" is already used.');
  });

  it("refuses more than one word", () => {
    expect(textOf(renameLine("10", 1, "my price"))).toMatch(/one word/);
  });

  it("refuses reserved names", () => {
    expect(textOf(renameLine("10", 1, "line7"))).toMatch(/reserved/);
    expect(textOf(renameLine("10", 1, "pi"))).toMatch(/reserved/);
  });

  it("keeps currency symbols", () => {
    expect(textOf(renameLine("$80\nline1 * 2", 1, "price"))).toBe("price = $80\nprice * 2");
  });
});
