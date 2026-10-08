// Calculates a whole sheet, top to bottom, one result per line.
import { create, all, type MathNode, type SymbolNode } from "mathjs";
import { parseLine } from "./translate";
import { suggestName } from "./suggest";

const math = create(all);

// The only bare names allowed without defining them. Anything else unknown is
// rejected here, before math.js can quietly read it as a unit like `m` or `cm`.
const CONSTANTS = new Set(["pi", "e", "tau"]);

export interface LineResult {
  lineNumber: number; // 1-based position in the textarea
  name: string; // `price`, or the automatic `line3`
  display?: string; // the formatted answer
  value?: number;
  currency?: string; // `$`, `€` or `£` when the answer is an amount of money
  error?: string;
  unknownName?: string; // the name that wasn't recognized, for fixes
  suggestion?: string; // a known name spelled like the unknown one
}

export function formatNumber(value: number, currency = ""): string {
  const rounded = Math.round(value * 100) / 100;
  if (Object.is(rounded, -0) || rounded === 0) return `${currency}0`;
  return rounded < 0 ? `-${currency}${-rounded}` : `${currency}${rounded}`;
}

// Names a line uses, skipping function names like `sqrt` in `sqrt(9)`.
function namesUsed(node: MathNode): string[] {
  const names: string[] = [];
  node.traverse((child, path, parent) => {
    if ((child as SymbolNode).isSymbolNode && !(parent?.type === "FunctionNode" && path === "fn")) {
      names.push((child as SymbolNode).name);
    }
  });
  return names;
}

export function calculateSheet(text: string): LineResult[] {
  const lines = text.split("\n");
  const known: Record<string, number> = {};
  const knownCurrency: Record<string, string> = {};
  const results: LineResult[] = [];

  // Names defined anywhere in the sheet, to explain "used before it's defined".
  const definedLater = new Set(lines.map((l) => parseLine(l).name).filter(Boolean) as string[]);

  lines.forEach((raw, index) => {
    if (!raw.trim()) return;
    const lineNumber = index + 1;
    const parsed = parseLine(raw);
    const name = parsed.name ?? `line${lineNumber}`;
    const result: LineResult = { lineNumber, name };
    results.push(result);

    if (!parsed.expression) {
      result.error = `Nothing to calculate after "${name} =".`;
      return;
    }

    let node: MathNode;
    try {
      node = math.parse(parsed.math);
    } catch {
      result.error = "I can't read this line.";
      return;
    }

    const used = namesUsed(node);
    for (const usedName of used) {
      if (usedName in known || CONSTANTS.has(usedName)) continue;
      result.unknownName = usedName;
      if (definedLater.has(usedName) || /^line\d+$/.test(usedName)) {
        result.error = `${usedName} isn't defined above this line.`;
        return;
      }
      result.error = `I don't know ${usedName}.`;
      result.suggestion = suggestName(usedName, Object.keys(known));
      return;
    }

    // The answer is money if the line, or any name it uses, is money.
    const currencies = new Set(parsed.currencies);
    used.forEach((n) => knownCurrency[n] && currencies.add(knownCurrency[n]));
    if (currencies.size > 1) {
      result.error = `Can't mix ${[...currencies].join(" and ")} on one line.`;
      return;
    }
    const currency = [...currencies][0];

    let value: unknown;
    try {
      value = node.evaluate({ ...known });
    } catch {
      result.error = "I can't calculate this line.";
      return;
    }

    if (math.typeOf(value) === "Unit") {
      result.error = "Units aren't supported yet.";
      return;
    }
    if (typeof value !== "number" || Number.isNaN(value)) {
      result.error = "I can't calculate this line.";
      return;
    }
    if (!Number.isFinite(value)) {
      result.error = "That's dividing by zero.";
      return;
    }

    result.value = value;
    result.currency = currency;
    result.display = parsed.isPercent ? `${formatNumber(value * 100)}%` : formatNumber(value, currency);
    known[name] = value;
    if (currency) knownCurrency[name] = currency;
  });

  return results;
}
