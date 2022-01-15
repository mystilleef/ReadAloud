import { logError } from "./error";
import { selectedTextStream, sendRead } from "./message";

const SELECTION_TIMEOUT = 500;
let TIMEOUT_ID = 0;

document.addEventListener("mouseup", _e => {
  window.clearTimeout(TIMEOUT_ID);
  TIMEOUT_ID = window.setTimeout(sendSelectedTextMessage, SELECTION_TIMEOUT);
});

selectedTextStream.subscribe(([_data, sender]) => {
  if (sender.id !== chrome.runtime.id) return;
  sendSelectedTextMessage();
});

function sendSelectedTextMessage(): void {
  sendRead(selectedText().trim()).catch(logError);
}

function selectedText(): string {
  if (selectionExistsIn(window)) return selectionFrom(window);
  if (selectionExistsIn(document)) return selectionFrom(document);
  return "";
}

function selectionExistsIn(root: Window | Document): boolean {
  return root ? Boolean(root.getSelection()) : false;
}

function selectionFrom(root: Window | Document): string {
  const selection = root.getSelection();
  return selection ? selection.toString() : "";
}
