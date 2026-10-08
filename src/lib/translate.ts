// Turns friendly calculator phrases into plain math that math.js understands.
// Percentages are always handled here, so math.js never has to guess what `%` means.

const NUM = String.raw`\d+(?:\.\d+)?`;

// `21%` -> `(21/100)`, but only when the `%` is not followed by another value,
// so `10 % 3` (remainder) is left alone.
function percentLiterals(expr: string): string {
  return expr.replace(new RegExp(String.raw`(${NUM})\s*%(?!\s*[\w(.])`, "g"), "($1/100)");
}

// `150 + 21%` -> `(150) * (1 + 21/100)`. Only a trailing percentage counts.
function addOrSubtractPercent(expr: string): string {
  const match = expr.match(new RegExp(String.raw`^(.+?)\s*([+-])\s*(${NUM})\s*%\s*$`));
  if (!match) return expr;
  const [, base, sign, pct] = match;
  return `(${translateExpression(base)}) * (1 ${sign} ${pct}/100)`;
}

// Translates the right-hand side of a line (everything after `name =`).
export function translateExpression(expr: string): string {
  const text = expr.trim();

  // `20% off 80` -> `(80) * (1 - (20/100))`
  const off = text.match(/^(.+?)\s+off\s+(.+)$/i);
  if (off) {
    return `(${translateExpression(off[2])}) * (1 - (${translateExpression(off[1])}))`;
  }

  const withPercent = addOrSubtractPercent(text);
  if (withPercent !== text) return withPercent;

  // `21% of 150` and `rate of net` -> multiplication
  return percentLiterals(text).replace(/\s+of\s+/gi, " * ");
}

export interface ParsedLine {
  name: string | null; // set when the line starts with `name =`
  expression: string; // the friendly text after the name
  math: string; // what math.js will calculate
  isPercent: boolean; // the line is just a percentage, like `rate = 21%`
  currencies: string[]; // currency symbols typed on the line, like `$`
}

// Currency symbols are only labels: they're removed before calculating
// and put back on the answer. Nothing is converted.
const CURRENCY = /[$€£]/g;

const NAMED = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)\s*(.*)$/;

export function parseLine(line: string): ParsedLine {
  const named = line.match(NAMED);
  const name = named ? named[1] : null;
  const expression = (named ? named[2] : line).trim();
  const currencies = [...new Set(expression.match(CURRENCY) ?? [])];
  return {
    name,
    expression,
    math: translateExpression(expression.replace(CURRENCY, "")),
    isPercent: new RegExp(String.raw`^${NUM}\s*%$`).test(expression),
    currencies,
  };
}
