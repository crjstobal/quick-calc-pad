---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Type a calculation and see the answer**
  Becomes usable: The Quick Calc Pad page runs locally with the notepad look. Typing `20% off 80` shows `line1  64` below the separator, and `line1 * 2` on the next line shows `line2  128`. Basic math, brackets, powers, and the four percentage phrases all work. Nothing is saved yet, and only the Notes sheet exists.
  Why now: This is the kernel (percentages written the way people say them, plus reusable results) and the biggest unknown (how math.js treats `%` and unit words). If either is wrong, we find out on day one. It also sets up the project so every later slice has somewhere to land.
  PRD ref: `prd.md > The Core Journey` (steps 1–4), `prd.md > Typing Calculations`, `prd.md > Line Names and Reuse`, `prd.md > Screens and Layout`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Stack`, `spec.md > Look and Feel`, `spec.md > Page Shell (index.astro)`, `spec.md > Translator (lib/translate.ts)`, `spec.md > Sheet Calculator (lib/calculate.ts)`, `spec.md > Page Script (scripts/app.ts)`, `spec.md > File Structure`
  Build: Create the Astro project (with `base: "/quick-calc-pad"`), install math.js, Kalam, and Vitest. Build the page shell (tabs drawn but only Notes active, tips, textarea, separator, results), the notepad styles, the translator, the sheet calculator, and the page script that recalculates on every keystroke. Write Vitest checks for the PRD examples. Check how math.js treats `%` and unit words, and record the findings.
  Verify (mechanical): `npm test` passes (`20% off 80` = 64, `(2 + 3) * 4` = 20, `150 + 21%` = 181.5, `line1 * 2` doubles line 1, empty lines give no result); `npm run build` succeeds; a headless-browser script types those lines into the running dev page and reads the expected results from the results area.
  Learner check: Run `npm run dev` and open http://localhost:4321/quick-calc-pad/. Type `20% off 80`, then `line1 * 2` on a new line, and then a calculation of your own. You should see each answer appear below the dashed line next to its name as you type. Does the look and the handwriting feel the way you pictured it?
  Commit: `Add notepad page with live percentage calculations`

- [x] **2. Rename a result and every use follows**
  Becomes usable: Clicking `line1` in the results lets you type `price`. Line 1 becomes `price = 20% off 80`, every other `line1` changes to `price`, and the answers stay the same.
  Why now: Reusable names are the second half of the kernel, and renaming changes the text itself, so it has to work before errors and templates build on it.
  PRD ref: `prd.md > Line Names and Reuse`, `prd.md > The Core Journey` (step 5)
  Spec ref: `spec.md > Rename Tool (lib/rename.ts)`, `spec.md > Page Script (scripts/app.ts)`
  Build: Write the rename tool (whole-word replace, refuse names that are taken or more than one word) and its Vitest checks. Add click-to-rename in the results (an inline box; Enter saves, Escape cancels).
  Verify (mechanical): `npm test` passes the rename checks; a headless-browser script renames `line1` to `price` and confirms the textarea text and unchanged results.
  Learner check: Type two lines where the second uses `line1`. Click `line1` in the results, type `price`, and press Enter. Both lines should now say `price`, with the same answers.
  Commit: `Add click-to-rename for line names`

- [x] **3. Mistakes explain themselves and offer a fix**
  Becomes usable: A line that can't be calculated is marked in red on its result row, with a tooltip explaining why. A misspelled name gets a "Did you mean price?" button that fixes the line. Other lines keep working.
  Why now: Once names can be typed and renamed, typos in names are the most likely mistake. This finishes the Notes sheet before we add more sheets.
  PRD ref: `prd.md > Errors and Fixes`, `prd.md > The Core Journey` (step 6), `prd.md > States and Boundaries`
  Spec ref: `spec.md > Name Suggestions (lib/suggest.ts)`, `spec.md > Sheet Calculator (lib/calculate.ts)`, `spec.md > Important Failure Modes`
  Build: Write the name-suggestion check and its Vitest checks. Have the calculator return errors per line (unknown name, name used before it's defined, units, anything unreadable). Show the red result row, the tooltip, and the one-click fix.
  Verify (mechanical): `npm test` passes the error and suggestion checks; a headless-browser script types `pric + 5` under `price = …`, confirms the suggestion appears, clicks it, and reads the corrected result, and confirms another line still shows its answer.
  Learner check: Under a line named `price`, type `pric + 5`. You should see the red row and the "Did you mean price?" tooltip. Click the fix and check the answer appears. Then type nonsense on another line and read the message.
  Commit: `Add error tooltips with name fixes`

- [x] **4. Folder tabs with templates, remembered after reload**
  Becomes usable: Notes, VAT, Discounts, and Compound interest tabs each hold their own sheet. Clicking VAT shows its working template, and changing `net` updates everything below. Going back to Notes shows your lines untouched. Reloading the page restores every tab and opens on Notes.
  Why now: Tabs and saving share one piece (the saved sheets), and they complete the PRD's journey. They come after the calculator because a template is only useful once the lines in it calculate, rename, and explain errors.
  PRD ref: `prd.md > Templates`, `prd.md > Saving in the Browser`, `prd.md > The Core Journey` (steps 7–9), `prd.md > States and Boundaries`
  Spec ref: `spec.md > Templates (lib/templates.ts)`, `spec.md > Storage (lib/storage.ts)`, `spec.md > Data Model`, `spec.md > Page Script (scripts/app.ts)`
  Build: Write the three templates and the storage (key `quick-calc-pad:v1`, start from the templates when nothing is saved or the saved data is unreadable). Make the tabs switch sheets, and save on every keystroke and rename.
  Verify (mechanical): `npm test` checks each template calculates with no errors (VAT: 150 → vat 31.5, total 181.5) and that storage round-trips and recovers from unreadable data; a headless-browser script types in Notes, edits VAT `net` to 200 (total 242), switches back to Notes, reloads, and confirms both sheets were restored and Notes is active.
  Learner check: Type something in Notes, open VAT and change `net` to 200, then open Discounts and Compound interest. Go back to Notes, then reload the page. Everything should be where you left it.
  Commit: `Add template tabs and browser saving`

- [x] **5. Live on GitHub Pages**
  Becomes usable: Anyone can open Quick Calc Pad at `https://<github-user>.github.io/quick-calc-pad/`, from the public repo that also includes an English README and an open-source license.
  Why now: Last, because it publishes the finished behavior. Creating the public repo and pushing is an outward-facing step, so it happens only with the learner's go-ahead.
  PRD ref: `prd.md > What We're Building`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`, `spec.md > External Services and Dependencies`, `spec.md > File Structure`
  Build: Add the GitHub Actions workflow (`withastro/action`), `site` in `astro.config.mjs`, an English README (what it is, how to run it, the live link), and an MIT LICENSE unless the learner prefers another. With the learner's agreement, create the public `quick-calc-pad` repo, check that no private files are tracked, push, and set Pages → Source to GitHub Actions.
  Verify (mechanical): `npm run build` succeeds; `git ls-files` doesn't include `devpost/learner-profile.md` or any `.env`; the GitHub Action run succeeds; the live URL returns the page and a headless-browser script calculates `20% off 80` = 64 on it.
  Learner check: Open the live link on your phone, type `21% of 150`, and switch to the VAT tab.
  Commit: `Add GitHub Pages deployment, README, and license`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1 (look, handwriting, and the feel of live answers, while they're still cheap to change)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

- Astro 7.x instead of 5.x, with Node 22.12 or newer — the current Astro release is 7.3; nothing in the plan depended on version 5.
- Unknown names are rejected before math.js runs — the risk check showed math.js silently turns unknown words like `m` or `cm` into units, and `10 % 3` means remainder. Our translator already owns every `%`, so only the unit handling changed.
- Margin name labels on typed lines and currency symbols as labels (`$5 + $10` = `$15`) were added — the learner asked for both at the first hands-on check; conversion between currencies stays deferred.
