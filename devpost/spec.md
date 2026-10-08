---
doc: spec
status: approved
---

# Quick Calc Pad — Technical Spec

## How This Works, In Plain Language
It's one web page built with **Astro**, the tool you already use. Astro turns the page into plain HTML when you build it, and a `<script>` on the page runs in the visitor's browser and does all the work. "Static" only means there's no server behind it. The page can still be fully interactive.

When you type in the notepad, the script reads your text line by line. For each line, a small **translator** we write ourselves rewrites the friendly phrases into plain math (`20% off 80` becomes `80 * (1 - 20/100)`). Then **math.js**, a free math library, calculates the answer, using the answers from earlier lines as named values. The results appear below the separator, each one next to its line's name.

Each folder tab is its own sheet of text. Everything is saved in the browser's **localStorage**, a small notebook the browser keeps for one website, so it's still there next time. No server, no accounts, no API keys.

The site is published for free on **GitHub Pages**, straight from the public repo the hackathon needs anyway.

Why this shape: everything the PRD asks for can happen inside the browser, so adding a server would only add cost and things that can break.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. **Open the page** → GitHub Pages sends the built HTML → the script loads the saved sheets from localStorage (or the starting templates on a first visit) → the Notes tab is shown.
2. **Type `20% off 80`** → on every keystroke, the script splits the Notes text into lines → the translator rewrites the line → math.js returns `64` → the results area shows `line1  64` → the sheet is saved to localStorage.
3. **Type `line1 * 2`** → `line1` is available because each answer is stored under its line's name before the next line is calculated → `line2  128`.
4. **Click `line1` in the results and type `price`** → the rename tool changes the text itself: line 1 becomes `price = 20% off 80`, and every later `line1` becomes `price` → everything recalculates, and the answers stay the same.
5. **Type `pric + 5`** → math.js lists the names the line uses → `pric` isn't defined → the closest-spelling check finds `price` → the result row shows the error and a "Did you mean price?" button → clicking it replaces `pric` in the text.
6. **Click the VAT tab** → the script shows the VAT sheet's saved text (the starting template the first time) → the Notes text is left untouched.
7. **Change `net = 150` to `200`** → the same calculate-on-type loop updates every line below.
8. **Reload** → step 1 restores every sheet from localStorage.

## Stack
- **Astro** 7.x — https://docs.astro.build. Requires Node 22.12 or newer. Learner's choice: it's the tool they already use, and it now does an interactive page through a client-side `<script>` (https://docs.astro.build/en/guides/client-side-scripts/). No React or other UI framework.
- **TypeScript** inside Astro's `<script>` (works without any setup).
- **math.js** — https://mathjs.org/docs/expressions/parsing.html. Learner accepted the recommendation: it handles brackets, powers, and named values, and `parse()` lets us list the names a line uses. The accepted tradeoff is a bigger download. **Check early in the build:** how math.js treats `%` and unit words (see *Important Failure Modes*). Our translator handles `%` before math.js sees it, so we don't depend on its behavior.
- **Kalam** handwritten font (learner's pick after comparing four fonts for readability), installed as a package with no CDN — https://fontsource.org/fonts/kalam.
- **Vitest** for small automatic checks of the translator, the rename tool, and the spell suggestions — https://vitest.dev. It uses the same engine as Astro, so there's nothing extra to configure.

## Where It Runs and How Someone Tries It
- **Locally:** Node 22.12 or newer. `npm install`, then `npm run dev`, then open the address it prints (http://localhost:4321/quick-calc-pad/).
- **Checks:** `npm test`.
- **Live (learner's choice):** GitHub Pages from the public repo. A GitHub Action (`withastro/action`) builds and publishes on every push to `main` — https://docs.astro.build/en/guides/deploy/github/. `astro.config.mjs` sets `site: "https://<github-user>.github.io"` and `base: "/quick-calc-pad"`. In the repo settings, Pages → Source must be set to "GitHub Actions".
- **Demo video:** record either the local or the live page, following the PRD's journey. The required public repo is the same one that Pages publishes from.

## Look and Feel
Carried from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.
- **Typography:** Kalam everywhere, including the typing area, results, and tabs. Numbers stay readable, and the text is a little larger than usual (about 20px) so the handwriting reads well.
- **Paper:** a cream sheet (`#fdf8e8`) with pale blue ruled lines and a thin red margin line on the left, like a real notepad.
- **Ink:** dark navy for text. Results in a darker ink and bold. Errors in red pencil with a wavy underline.
- **Folder tabs:** manila-colored tabs with rounded tops above the sheet. The active tab joins the sheet with no line between them.
- **Separator:** a hand-drawn-looking dashed line between typing and results.
- **Energy:** calm and roomy, with no clutter. Intro tips in small grey handwriting.
- Colors are proposed here because `prd.md` left them open. Change them freely at review.

## Components

### Page Shell (`index.astro`)
Builds the HTML: folder tabs, intro tips, typing area (`<textarea>`), separator, results list. Loads the font and styles.
PRD ref: `prd.md > Screens and Layout`.

### Translator (`lib/translate.ts`)
Rewrites one line of friendly text into plain math. Rules, applied in this order:
- `A% off B` → `(B) * (1 - A/100)`
- `B + A%` → `(B) * (1 + A/100)` and `B - A%` → `(B) * (1 - A/100)`
- `A of B` → `(A) * (B)` (so `21% of 150` and `rate of net` both work)
- any remaining `A%` → `(A/100)`
- `name = …` at the start is kept as the line's name; only the right side is translated.

PRD ref: `prd.md > Typing Calculations`.

### Sheet Calculator (`lib/calculate.ts`)
Takes a sheet's whole text and returns one result per line: `{ name, value | error, suggestion? }`. It works top to bottom with a growing list of known names. Each non-empty line is named either by `name = …` in the text or automatically as `line<N>` (N = the line's number in the textarea). One bad line gives an error for that line only, and the rest keep calculating. Values are rounded to 2 decimal places for display. A line that is a bare percentage shows as `21%`.
PRD ref: `prd.md > Typing Calculations`, `prd.md > Line Names and Reuse`, `prd.md > Errors and Fixes`.

### Name Suggestions (`lib/suggest.ts`)
For an unknown name, finds the known name with the closest spelling (at most 2 letters different). If none is close, there's no suggestion, only the explanation.
PRD ref: `prd.md > Errors and Fixes`.

### Rename Tool (`lib/rename.ts`)
Renaming line N from `old` to `new` writes `new = ` at the start of that line (or replaces its existing name) and replaces every whole-word `old` on the other lines with `new`. It refuses names that aren't single words or that are already used.
PRD ref: `prd.md > Line Names and Reuse`.

### Templates (`lib/templates.ts`)
The starting text of each sheet:
- **Notes:** empty.
- **VAT:** `net = 150` / `rate = 21%` / `vat = rate of net` / `total = net + vat`
- **Discounts:** `price = 80` / `discount = 20%` / `savings = discount of price` / `final = price - savings` / `20% off 80`
- **Compound interest:** `principal = 1000` / `rate = 5%` / `years = 10` / `total = principal * (1 + rate)^years` / `interest = total - principal`

PRD ref: `prd.md > Templates`.

### Storage (`lib/storage.ts`)
Reads and writes all sheets to localStorage under one key. If nothing is saved, or the saved data is unreadable, it starts from the templates.
PRD ref: `prd.md > Saving in the Browser`.

### Page Script (`scripts/app.ts`)
Connects everything: switches tabs, recalculates and saves on every keystroke, draws the results rows, handles clicking a name to rename it (an inline text box; Enter saves, Escape cancels), and shows the error tooltip with its fix button.
PRD ref: `prd.md > The Core Journey`.

## Data Model
One object, saved in localStorage under the key `quick-calc-pad:v1`:

```json
{
  "sheets": {
    "notes": "20% off 80\nline1 * 2",
    "vat": "net = 150\nrate = 21%\nvat = rate of net\ntotal = net + vat",
    "discounts": "…",
    "compound": "…"
  }
}
```

- **Where it lives:** the visitor's browser, for this site only.
- **How it's updated:** saved on every keystroke and every rename.
- **When they leave and come back:** all sheets are restored, and the page opens on Notes (`prd.md > States and Boundaries`).
- **Names live in the text itself** (`price = …`), so nothing else needs saving. Results are always recalculated, never stored.

## File Structure
```
app/
├── .github/workflows/deploy.yml   # Builds and publishes to GitHub Pages on push to main
├── astro.config.mjs               # site + base for GitHub Pages
├── package.json
├── public/                        # favicon
├── src/
│   ├── pages/index.astro          # Page Shell: tabs, tips, textarea, separator, results
│   ├── styles/notepad.css         # Paper, ink, tabs, tooltip
│   ├── scripts/app.ts             # Page Script: wiring and drawing
│   └── lib/
│       ├── translate.ts           # Friendly phrases → plain math
│       ├── calculate.ts           # Sheet text → results per line
│       ├── suggest.ts             # "Did you mean …?"
│       ├── rename.ts              # Rename a line and its uses
│       ├── templates.ts           # Starting text for each tab
│       └── storage.ts             # localStorage read/write
├── tests/                         # Vitest checks for lib/ (PRD examples)
├── README.md                      # In English: what it is, how to run, live link
├── LICENSE                        # Open-source license (MIT unless the learner prefers another)
└── devpost/                       # Devpost learning workspace
```

## External Services and Dependencies
- **GitHub Pages + GitHub Actions:** free for public repos. No keys. Setup is described under *Where It Runs*.
- **npm packages:** `astro`, `mathjs`, `@fontsource/kalam`, `vitest` (development only). No API calls and no secrets.

## Important Failure Modes
- **math.js reads unknown short names as units** (for example `m`, `cm`) → the calculator rejects any name not defined above the line before math.js runs ("I don't know cm."); only `pi`, `e`, and `tau` are allowed without defining them. A leftover unit result still shows "Units aren't supported yet."
- **Inserting a line in the middle shifts automatic names** (`line2` becomes `line3`) → accepted for this proof of concept. Renaming a line fixes its name for good.
- **A line uses a name that comes later in the sheet** → that line shows an error: "price isn't defined above this line."
- **Saved data is unreadable** → start fresh from the templates instead of showing a broken page.

## What Was Simplified and Why
- **One plain `<textarea>`** instead of a fancy line-by-line editor. It's the simplest typing area that works. Because of that, errors are marked on the line's **result row** (red, wavy, with the tooltip there), not inside the typed text. A full editor would mean a code-editor library or a custom line component.
- **Names are stored in the text (`price = …`)** instead of a separate list. This makes renaming, saving, and templates all work the same way.
- **Automatic names follow the line number** instead of being permanent IDs, which is good enough for a few quick lines.

## Decisions and Open Issues
**Learner decisions**
- Astro, the tool they already use, with a client-side script and no extra framework.
- math.js for the math, with our own translator for percentage phrases. The accepted tradeoff is a bigger download.
- GitHub Pages for a live link from the public repo.

**Implementation details derived from those (please check at review)**
- Errors appear on the result row, not inside the typed line (see *What Was Simplified*).
- Font: Kalam, chosen by the learner because the first proposal was hard to read. The notepad palette is proposed, since `prd.md > Look and Feel` left colors open.
- Vitest for automatic checks of the PRD examples.

**Learner uncertainty discussed**
- "Astro… that's only for static stuff, correct?" Clarified: static means no server, not no interactivity. A `<script>` in an Astro page runs in the browser, and that's the whole app. We'll see this when the first calculation appears on screen.

**Still open**
- Project name: **Quick Calc Pad**, repo `quick-calc-pad` (live at `https://<github-user>.github.io/quick-calc-pad/`).
- How math.js treats `%` and unit words: check in the first build step.
