// "Did you mean …?" — finds the known name spelled most like an unknown one.

// How many single-letter edits turn `a` into `b` (Levenshtein distance).
export function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

const MAX_EDITS = 2;

export function suggestName(unknown: string, knownNames: string[]): string | undefined {
  let best: string | undefined;
  let bestDistance = MAX_EDITS + 1;
  for (const name of knownNames) {
    const distance = editDistance(unknown.toLowerCase(), name.toLowerCase());
    if (distance < bestDistance) {
      best = name;
      bestDistance = distance;
    }
  }
  return best;
}
