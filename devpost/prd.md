---
doc: prd
status: approved
---

# Quick Calc Pad — Product Requirements

A notepad-style calculator web page for anyone who needs a quick percentage, discount, VAT, or interest answer without doing several steps on a calculator or asking an AI.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. Someone opens the page. There's no sign-up. They land on their own blank **Notes** tab. Next to it are the template tabs (VAT, Discounts, Compound interest), then a short intro with tips, a typing area, and a results area below it.
2. They type a calculation on a line, such as `20% off 80`.
3. Below, the results area shows that line's automatic name and its answer: `line1  64`.
4. They type another line that reuses the first one: `line1 * 2` → `line2  128`.
5. They click `line1` in the results area and rename it to `price`. Every line that used `line1` now says `price`, and the results don't change.
6. They make a typo (`pric + 5`). That line shows an error tooltip: "I don't know `pric`. Did you mean `price`?" Clicking the fix corrects it.
7. They click the **VAT** tab and move to the VAT sheet, which already has its lines and results. Their Notes tab stays as it was.
8. They change a number in the template, and every result updates right away.
9. They close the browser tab and come back later. Every sheet (Notes and any edited templates) is still there.

Success is steps 2 to 8 working smoothly in a one-minute demo.

## Screens and Layout
A single page, arranged top to bottom:

1. **Folder tabs**: Notes (the person's own blank sheet), VAT, Discounts, and Compound interest, shaped like the tabs on a physical folder. Each tab is its own sheet; clicking one switches to it.
2. **Intro tips**: a short text explaining how to use the page.
3. **Typing area**: where lines are written, with each line's name (`line1`, or `price` after a rename) written small in the left margin.
4. **A visual separator** between typing and results.
5. **Results area**: one row per line, showing the line's name and its answer.

## Look and Feel
- Handwritten-style font.
- A physical notepad or folder metaphor, with template tabs like folder tabs.
- Colors not established; `4-spec` may propose a palette that fits the handwritten notepad feel.

## Features and Behavior

### Typing Calculations
Source: `scope.md > The POC Boundary`.
- Each line is evaluated as you type, and its result appears in the results area.
- Supported in this version:
  - Basic math: `+ - * /`, brackets, and powers.
  - Percentage phrases: `X% of Y`, `X% off Y`, `Y + X%`, `Y - X%`.
  - Word operators `plus`, `minus`, `times`, `divided by`, and running totals: a line that starts with an operator (`plus 30`, `+ 30`) continues from the answer just above. (Added at the final review.)
  - Currency symbols `$`, `€`, `£` as labels, not conversions: the answer keeps the symbol, and so do names that hold money. (Added at the first hands-on check.)
- [ ] Typing `20% off 80` shows `64`.
- [ ] Typing `(2 + 3) * 4` shows `20`.
- [ ] Typing `150 + 21%` shows `181.5`.
- [ ] Results update without pressing any button.
- [ ] Empty lines show no result row and no error.
- [ ] `$5 + $10` shows `$15`, and after `price = $80`, `price * 2` shows `$160`.
- [ ] Mixing symbols on one line (`$5 + €3`) shows an error.
- [ ] Each typed line has its name in the margin.
- [ ] `20% off 80` followed by `plus 30` shows `94`.

### Line Names and Reuse
Source: `scope.md > The Unique Kernel`.
- Every non-empty line gets an automatic name: `line1`, `line2`, and so on.
- Any later line can use those names in a calculation.
- Clicking a name in the results area lets you type a new one.
- Renaming updates every line that uses the old name.
- [ ] Typing `line1 * 2` on line 2 shows double line 1's result.
- [ ] Renaming `line1` to `price` changes `line1` to `price` in every line that uses it, and all results stay the same.
- [ ] Changing a number on line 1 updates every line that depends on it.

### Errors and Fixes
- A line that can't be calculated is marked, and a tooltip explains why.
- When the problem is a misspelled name, the tooltip suggests the closest existing name with a one-click fix.
- [ ] `pric + 5` (when `price` exists) shows "I don't know `pric`. Did you mean `price`?", and clicking it corrects the line.
- [ ] One broken line doesn't stop the other lines from showing results.

### Templates
Source: `scope.md > The POC Boundary`.
- Three template tabs: **VAT**, **Discounts**, **Compound interest**, next to the person's own **Notes** tab.
- Each tab is a separate sheet. Clicking a template tab moves you to it, with a short set of example lines with meaningful names, ready for you to change the numbers.
- Switching tabs never changes another tab's lines. Line names belong to their own sheet.
- [ ] Clicking **VAT** shows a sheet with net amount, VAT rate, VAT amount, and total, with results shown.
- [ ] Going back to **Notes** shows the person's lines exactly as they left them.
- [ ] Changing the net amount in the loaded template updates the VAT amount and total.
- [ ] Each of the three tabs loads its own working example.

### Saving in the Browser
Source: `scope.md > The POC Boundary`.
- The page remembers every sheet's lines and names, with no account.
- [ ] Reloading the page restores the same lines, names, and results on every tab, including edits made to a template.

## States and Boundaries
- **First visit**: the intro tips are visible, and the typing area is empty and ready to type in.
- **Line with an error**: marked, with an explanatory tooltip. Other lines keep working.
- **Returning visit**: every tab's lines are restored, and the page opens on the Notes tab.

## Product Decisions
- Typing on top, results below, with a visual separator. This was the learner's layout choice.
- Lines get automatic names (`line1`, ...) that can be renamed by clicking them. Results are reusable from the first line without learning any syntax.
- Renaming updates every reference automatically: "better change automatically."
- Errors explain the problem and offer a fix. This was chosen over explanation only.
- Exactly three templates: VAT, Discounts/percentages, and Compound interest. "This is just a test!"
- Tabs are separate sheets: "you're moved to the other tab, the original tab stays intact."
- Saved in the browser, no accounts. From scope: "just enter and start typing."

**Assumptions (please confirm or correct):**
- The supported math and percentage phrases listed under *Typing Calculations* are my proposal for "general math." Anything outside that list shows an error.
- Only misspelled names get a suggested fix. Other errors only explain the problem.
- Answers show up to 2 decimal places.
- Edits to a template tab are saved like Notes. There's no "reset template" button in this version.
- The intro tips are always visible. They don't disappear once you start typing.

## What We're Building
Everything under *Features and Behavior*: typing calculations, line names and reuse, errors with name fixes, the three templates, and saving in the browser.

## Deferred From the POC
- Currencies and anything else that needs live outside data, because it requires an API (from `scope.md > Later`).
- Fix suggestions for errors other than misspelled names.
- Units (km, kg, and so on) and dates.

## Possible Later Enhancements
- More templates, possibly ones people create themselves.
- Several saved notes instead of one.

## Non-Goals
- Accounts or logins: "just enter and start typing."
- An AI assistant. The point is to avoid asking an AI.
- Long documents. This is meant for quick calculations with a few lines.

## Open Questions
- None. The name was settled during `4-spec`: **Quick Calc Pad**.
