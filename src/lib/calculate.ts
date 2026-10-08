// Calculates a whole sheet, top to bottom, one result per line.
import { create, all, type MathNode, type SymbolNode } from "mathjs";
import { parseLine } from "./translate";

const math = create(all);

// The only bare names allowed without defining them. Anything else unknown is
// rejected here, before math.js can quietly read it as a unit like `m` or `cm`.
const CONSTANTS = new Set(["pi", "e", "tau"]);

export interface LineResult {
  lineNumber: number; // 1-based position in the textarea
  name: string; // `price`, or the automatic `line3`
  display?: string; // the formatted answer
  value?: number;
  error?: string;
  unknownName?: string; // the name that wasn't recognized, for fixes
}

export function formatNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? "0" : String(rounded);
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

    for (const used of namesUsed(node)) {
      if (used in known || CONSTANTS.has(used)) continue;
      result.unknownName = used;
      result.error = definedLater.has(used) || /^line\d+$/.test(used)
        ? `${used} isn't defined above this line.`
        : `I don't know ${used}.`;
      return;
    }

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
    result.display = parsed.isPercent ? `${formatNumber(value * 100)}%` : formatNumber(value);
    known[name] = value;
  });

  return results;
}
