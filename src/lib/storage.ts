// Saves every sheet in the browser's localStorage, so it's all there next visit.
import { SHEET_IDS, TEMPLATES, type Sheets } from "./templates";

export const STORAGE_KEY = "quick-calc-pad:v1";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

// Saved sheets, falling back to the templates for anything missing or unreadable.
export function loadSheets(storage: StorageLike): Sheets {
  const sheets: Sheets = { ...TEMPLATES };
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? "null")?.sheets;
    for (const id of SHEET_IDS) {
      if (typeof saved?.[id] === "string") sheets[id] = saved[id];
    }
  } catch {
    // Unreadable data: start fresh from the templates.
  }
  return sheets;
}

export function saveSheets(storage: StorageLike, sheets: Sheets): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ sheets }));
  } catch {
    // Storage can be full or blocked (private windows); the page keeps working.
  }
}
