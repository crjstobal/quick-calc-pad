// Connects the notepad to the calculator: recalculates and redraws on every keystroke.
import { calculateSheet, type LineResult } from "../lib/calculate";
import { fixName, renameLine } from "../lib/rename";

const pad = document.querySelector<HTMLTextAreaElement>("#pad")!;
const results = document.querySelector<HTMLOListElement>("#results")!;
const gutter = document.querySelector<HTMLDivElement>("#gutter")!;

// Small name label next to each typed line, in the paper's margin.
function renderLabel(result: LineResult): HTMLSpanElement {
  const label = document.createElement("span");
  label.textContent = result.name;
  label.title = result.name;
  label.style.top = `calc(var(--line-height) * ${result.lineNumber - 1})`;
  if (result.error) label.classList.add("has-error");
  return label;
}

function renderResult(result: LineResult): HTMLLIElement {
  const row = document.createElement("li");
  row.className = "result";
  row.dataset.line = String(result.lineNumber);

  const name = document.createElement("button");
  name.type = "button";
  name.className = "name";
  name.textContent = result.name;
  name.title = "Click to rename";
  name.addEventListener("click", () => startRename(row, name, result));

  const value = document.createElement("span");
  value.className = "value";
  row.append(name, value);

  if (result.error) {
    row.classList.add("has-error");
    value.textContent = "can't calculate";
    row.append(renderTooltip(result));
  } else {
    value.textContent = result.display ?? "";
  }

  return row;
}

// The explanation under a broken line, with a one-click fix for misspelled names.
function renderTooltip(result: LineResult): HTMLDivElement {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.setAttribute("role", "note");
  tooltip.textContent = result.error ?? "";

  if (result.unknownName && result.suggestion) {
    const fix = document.createElement("button");
    fix.type = "button";
    fix.className = "fix";
    fix.textContent = `Did you mean ${result.suggestion}?`;
    fix.addEventListener("click", () => {
      pad.value = fixName(pad.value, result.lineNumber, result.unknownName!, result.suggestion!);
      update();
      pad.focus();
    });
    tooltip.append(" ", fix);
  }
  return tooltip;
}

// Swaps the name for a text box. Enter or clicking away saves, Escape cancels.
function startRename(row: HTMLLIElement, nameButton: HTMLButtonElement, result: LineResult) {
  const input = document.createElement("input");
  input.className = "rename";
  input.value = result.name;
  input.setAttribute("aria-label", `New name for ${result.name}`);
  input.size = Math.max(result.name.length, 6);
  nameButton.replaceWith(input);
  input.focus();
  input.select();

  let done = false;
  const finish = (save: boolean) => {
    if (done) return;
    if (save) {
      const outcome = renameLine(pad.value, result.lineNumber, input.value);
      if ("error" in outcome) {
        input.setCustomValidity(outcome.error);
        input.reportValidity();
        return;
      }
      pad.value = outcome.text;
    }
    done = true;
    update();
  };

  input.addEventListener("input", () => input.setCustomValidity(""));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") finish(true);
    if (event.key === "Escape") finish(false);
  });
  input.addEventListener("blur", () => {
    finish(true);
    if (!done) finish(false); // an invalid name on blur is dropped
  });
  row.dataset.renaming = "true";
}

function growPad() {
  pad.style.height = "auto";
  pad.style.height = `${pad.scrollHeight}px`;
}

function update() {
  const sheet = calculateSheet(pad.value);
  results.replaceChildren(...sheet.map(renderResult));
  gutter.replaceChildren(...sheet.map(renderLabel));
  growPad();
}

pad.addEventListener("input", update);
update();
pad.focus();
