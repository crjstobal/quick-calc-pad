// Renames a line's result and every use of the old name, by rewriting the sheet's text.
import { calculateSheet } from "./calculate";
import { parseLine } from "./translate";

const VALID_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
const RESERVED = new Set(["pi", "e", "tau", "of", "off", "mod", "to", "in", "plus", "minus", "times", "divided", "multiplied", "by"]);

export type RenameResult = { text: string } | { error: string };

const wholeWord = (name: string) => new RegExp(String.raw`(?<![\w$])${name}(?![\w])`, "g");

export function renameLine(text: string, lineNumber: number, newName: string): RenameResult {
  const lines = text.split("\n");
  const index = lineNumber - 1;
  if (!lines[index]?.trim()) return { error: "There's nothing on that line." };

  const sheet = calculateSheet(text);
  const oldName = sheet.find((r) => r.lineNumber === lineNumber)?.name;
  if (!oldName) return { error: "There's nothing on that line." };

  const name = newName.trim();
  if (name === oldName) return { text };
  if (!VALID_NAME.test(name)) return { error: "Use one word: letters, numbers or _, starting with a letter." };
  if (RESERVED.has(name) || /^line\d+$/.test(name)) return { error: `"${name}" is reserved. Try another name.` };
  if (sheet.some((r) => r.name === name)) return { error: `"${name}" is already used.` };

  const pattern = wholeWord(oldName);
  const renamed = lines.map((line, i) => {
    if (i === index) {
      const { name: existing, expression } = parseLine(line);
      const indent = line.match(/^\s*/)![0];
      return `${indent}${name} = ${existing ? expression : line.trim()}`;
    }
    if (!line.trim()) return line;
    // Only touch the calculation part, never another line's own name.
    const { name: lineName } = parseLine(line);
    if (lineName) {
      const [left, ...right] = line.split("=");
      return `${left}=${right.join("=").replace(pattern, name)}`;
    }
    return line.replace(pattern, name);
  });

  return { text: renamed.join("\n") };
}

// Replaces one misspelled name on a single line, for the "Did you mean …?" fix.
export function fixName(text: string, lineNumber: number, from: string, to: string): string {
  const lines = text.split("\n");
  const line = lines[lineNumber - 1] ?? "";
  const { name } = parseLine(line);
  if (name) {
    const [left, ...right] = line.split("=");
    lines[lineNumber - 1] = `${left}=${right.join("=").replace(wholeWord(from), to)}`;
  } else {
    lines[lineNumber - 1] = line.replace(wholeWord(from), to);
  }
  return lines.join("\n");
}
