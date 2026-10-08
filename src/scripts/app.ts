// Connects the notepad to the calculator: recalculates and redraws on every keystroke.
import { calculateSheet, type LineResult } from "../lib/calculate";

const pad = document.querySelector<HTMLTextAreaElement>("#pad")!;
const results = document.querySelector<HTMLOListElement>("#results")!;
const gutter = document.querySelector<HTMLDivElement>("#gutter")!;

// Small name label next to each typed line, in the paper's margin.
function renderLabel(result: LineResult): HTMLSpanElement {
  const label = document.createElement("span");
  label.textContent = result.name;
  label.title = result.name;
  label.style.top = `calc(var(--line-height) * ${result.lineNumber - 1})`;
  return label;
}

function renderResult(result: LineResult): HTMLLIElement {
  const row = document.createElement("li");
  row.className = "result";
  row.dataset.line = String(result.lineNumber);

  const name = document.createElement("span");
  name.className = "name";
  name.textContent = result.name;

  const value = document.createElement("span");
  value.className = "value";
  if (result.error) {
    row.classList.add("has-error");
    value.textContent = result.error;
  } else {
    value.textContent = result.display ?? "";
  }

  row.append(name, value);
  return row;
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
