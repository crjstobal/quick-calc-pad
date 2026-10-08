import { describe, expect, it } from "vitest";
import { calculateSheet } from "../src/lib/calculate";
import { loadSheets, saveSheets, STORAGE_KEY } from "../src/lib/storage";
import { SHEET_IDS, TEMPLATES } from "../src/lib/templates";

const answers = (text: string) => Object.fromEntries(calculateSheet(text).map((r) => [r.name, r.display ?? r.error]));

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v), data };
}

describe("templates (prd.md > Templates)", () => {
  it("every template calculates with no errors", () => {
    for (const id of SHEET_IDS) {
      expect(calculateSheet(TEMPLATES[id]).filter((r) => r.error)).toEqual([]);
    }
  });

  it("VAT: 150 -> vat 31.5, total 181.5; net 200 -> total 242", () => {
    expect(answers(TEMPLATES.vat)).toMatchObject({ net: "150", rate: "21%", vat: "31.5", total: "181.5" });
    expect(answers(TEMPLATES.vat.replace("net = 150", "net = 200"))).toMatchObject({ vat: "42", total: "242" });
  });

  it("Discounts and Compound interest give the expected answers", () => {
    expect(answers(TEMPLATES.discounts)).toMatchObject({ savings: "16", final: "64", line5: "64" });
    expect(answers(TEMPLATES.compound)).toMatchObject({ total: "1628.89", interest: "628.89" });
  });

  it("Notes starts empty", () => {
    expect(TEMPLATES.notes).toBe("");
  });
});

describe("saving in the browser (prd.md > Saving in the Browser)", () => {
  it("first visit starts from the templates", () => {
    expect(loadSheets(memoryStorage())).toEqual(TEMPLATES);
  });

  it("what's saved comes back, every tab", () => {
    const storage = memoryStorage();
    const sheets = { ...TEMPLATES, notes: "20% off 80", vat: TEMPLATES.vat.replace("150", "200") };
    saveSheets(storage, sheets);
    expect(loadSheets(storage)).toEqual(sheets);
  });

  it("unreadable data falls back to the templates", () => {
    expect(loadSheets(memoryStorage({ [STORAGE_KEY]: "{not json" }))).toEqual(TEMPLATES);
    expect(loadSheets(memoryStorage({ [STORAGE_KEY]: '{"sheets": {"notes": 5}}' }))).toEqual(TEMPLATES);
  });

  it("a blocked storage doesn't break saving", () => {
    const broken = { getItem: () => null, setItem: () => { throw new Error("full"); } };
    expect(() => saveSheets(broken, TEMPLATES)).not.toThrow();
  });
});
