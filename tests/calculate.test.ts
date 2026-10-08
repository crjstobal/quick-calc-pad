import { describe, expect, it } from "vitest";
import { calculateSheet } from "../src/lib/calculate";
import { translateExpression } from "../src/lib/translate";

const answers = (text: string) => calculateSheet(text).map((r) => [r.name, r.display ?? r.error]);

describe("percentage phrases (prd.md > Typing Calculations)", () => {
  it("20% off 80 is 64", () => {
    expect(answers("20% off 80")).toEqual([["line1", "64"]]);
  });

  it("150 + 21% is 181.5 and 150 - 10% is 135", () => {
    expect(answers("150 + 21%\n150 - 10%")).toEqual([
      ["line1", "181.5"],
      ["line2", "135"],
    ]);
  });

  it("21% of 150 is 31.5", () => {
    expect(answers("21% of 150")).toEqual([["line1", "31.5"]]);
  });

  it("works with names: rate of net", () => {
    expect(answers("net = 150\nrate = 21%\nvat = rate of net\ntotal = net + vat")).toEqual([
      ["net", "150"],
      ["rate", "21%"],
      ["vat", "31.5"],
      ["total", "181.5"],
    ]);
  });

  it("leaves remainder alone: 10 % 3 is 1", () => {
    expect(translateExpression("10 % 3")).toBe("10 % 3");
    expect(answers("10 % 3")).toEqual([["line1", "1"]]);
  });
});

describe("general math", () => {
  it("brackets and powers", () => {
    expect(answers("(2 + 3) * 4\n2^10")).toEqual([
      ["line1", "20"],
      ["line2", "1024"],
    ]);
  });

  it("rounds to 2 decimals", () => {
    expect(answers("10 / 3")).toEqual([["line1", "3.33"]]);
  });
});

describe("line names and reuse (prd.md > Line Names and Reuse)", () => {
  it("line1 * 2 doubles line 1", () => {
    expect(answers("20% off 80\nline1 * 2")).toEqual([
      ["line1", "64"],
      ["line2", "128"],
    ]);
  });

  it("empty lines give no result and keep line numbers", () => {
    expect(answers("5\n\n\nline1 + 1")).toEqual([
      ["line1", "5"],
      ["line4", "6"],
    ]);
  });

  it("changing line 1 updates what depends on it", () => {
    expect(answers("100\nline1 * 2")[1][1]).toBe("200");
  });
});

describe("one bad line doesn't stop the others", () => {
  it("unknown names, units and nonsense are errors on their own line", () => {
    const result = answers("hello there\n5 cm\n2 + 2\nm * 2");
    expect(result[0][1]).toMatch(/I don't know hello/);
    expect(result[1][1]).toMatch(/I don't know cm/);
    expect(result[2]).toEqual(["line3", "4"]);
    expect(result[3][1]).toMatch(/I don't know m/);
  });

  it("a name used before it's defined", () => {
    expect(answers("price * 2\nprice = 10")[0][1]).toBe("price isn't defined above this line.");
  });

  it("dividing by zero", () => {
    expect(answers("5 / 0")[0][1]).toBe("That's dividing by zero.");
  });
});

describe("currency symbols are labels, not conversions", () => {
  it("$5 + $10 is $15", () => {
    expect(answers("$5 + $10")).toEqual([["line1", "$15"]]);
  });

  it("symbols after the number work too", () => {
    expect(answers("5€ + 10€")).toEqual([["line1", "€15"]]);
  });

  it("names keep their currency", () => {
    expect(answers("price = $80\nprice * 2\n20% off price")).toEqual([
      ["price", "$80"],
      ["line2", "$160"],
      ["line3", "$64"],
    ]);
  });

  it("negative amounts put the sign first", () => {
    expect(answers("$5 - $10")).toEqual([["line1", "-$5"]]);
  });

  it("mixing currencies is an error", () => {
    expect(answers("$5 + €3")[0][1]).toBe("Can't mix $ and € on one line.");
  });
});
