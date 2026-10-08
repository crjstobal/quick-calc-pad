// The starting text of each folder tab. Notes is the person's own blank sheet.

export const SHEET_IDS = ["notes", "vat", "discounts", "compound"] as const;
export type SheetId = (typeof SHEET_IDS)[number];
export type Sheets = Record<SheetId, string>;

export const TEMPLATES: Sheets = {
  notes: "",
  vat: ["net = 150", "rate = 21%", "vat = rate of net", "total = net + vat"].join("\n"),
  discounts: [
    "price = 80",
    "discount = 20%",
    "savings = discount of price",
    "final = price - savings",
    "20% off 80",
  ].join("\n"),
  compound: [
    "principal = 1000",
    "rate = 5%",
    "years = 10",
    "total = principal * (1 + rate)^years",
    "interest = total - principal",
  ].join("\n"),
};
