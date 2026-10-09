# Quick Calc Pad

A notepad calculator for quick percentages, discounts, VAT, and interest. Open the page and type, with no account and nothing to set up.

**Try it:** https://crjstobal.github.io/quick-calc-pad/

Built for the Devpost "Build With AI: Basics" hackathon (2026).

## What it does

- **Plain-language percentages.** `20% off 80` gives 64, `21% of 150` gives 31.5, and `150 + 21%` gives 181.5. Brackets and powers work too.
- **Every answer has a name.** Lines are named `line1`, `line2`, and so on, so later lines can reuse them (`line1 * 2`). Click a name to rename it (for example, to `price`), and every line that uses it updates.
- **Money stays money.** `$5 + $10` gives `$15`, and names keep their symbol (`$`, `€`, `£`). Nothing is converted.
- **Mistakes explain themselves.** A line that can't be calculated says why, and a misspelled name gets a one-click "Did you mean price?" fix.
- **Folder tabs.** Your own Notes sheet, plus ready-to-edit VAT, Discounts, and Compound interest templates. Change a number, and everything below updates.
- **Remembered in your browser.** Every tab is saved in `localStorage`. There's no server and no sign-up.

## Run it locally

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev      # then open http://localhost:4321/quick-calc-pad/
npm test         # checks for the calculator, renaming, errors, templates, and saving
npm run build    # static site in dist/
```

## How it works

It's a single static [Astro](https://docs.astro.build) page. A script in the page runs in the browser:

1. `src/lib/translate.ts` rewrites friendly phrases into plain math (`20% off 80` becomes `(80) * (1 - (20/100))`).
2. `src/lib/calculate.ts` calculates each line with [math.js](https://mathjs.org), top to bottom, keeping earlier answers as named values. It rejects unknown names before math.js could read them as units.
3. `src/lib/rename.ts` and `src/lib/suggest.ts` handle renaming and "Did you mean …?" fixes by rewriting the text itself.
4. `src/lib/storage.ts` saves all tabs in `localStorage`, and `src/lib/templates.ts` holds the starting templates.
5. `src/scripts/app.ts` connects everything to the page, and `src/styles/notepad.css` draws the paper.

The site is deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Planning documents

The scope, product requirements, technical spec, and build checklist that guided this project are in [`devpost/`](devpost/).

## License

[MIT](LICENSE)
