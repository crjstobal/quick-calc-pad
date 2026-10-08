// Connects the notepad to the calculator: recalculates and redraws on every keystroke.
import { calculateSheet, type LineResult } from "../lib/calculate";

const pad = document.querySelector<HTMLTextAreaElement>("#pad")!;
const results = document.querySelector<HTMLOListElement>("#results")!;

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
  results.replaceChildren(...calculateSheet(pad.value).map(renderResult));
  growPad();
}

pad.addEventListener("input", update);
update();
pad.focus();
