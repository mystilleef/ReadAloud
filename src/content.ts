import { logError } from "./error";
import {
  selectedTextStream,
  sendRead,
  sendRefreshTts,
  startedSpeakingStream,
  stoppedSpeakingStream
} from "./message";

let TIMEOUT_ID = 0;
let SPEAKING_TIMEOUT_ID = 0;
const SELECTION_TIMEOUT = 500;
const SPEAKING_TIMEOUT = 5000;

startedSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id !== chrome.runtime.id) return;
  window.clearTimeout(SPEAKING_TIMEOUT_ID);
  SPEAKING_TIMEOUT_ID = window.setInterval(() => {
      sendRefreshTts().catch(logError);
    },
    SPEAKING_TIMEOUT);
});

stoppedSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id !== chrome.runtime.id) return;
  window.clearTimeout(SPEAKING_TIMEOUT_ID);
});

selectedTextStream.subscribe(([_data, sender]) => {
  if (sender.id !== chrome.runtime.id) return;
  sendSelectedTextMessage();
});

document.addEventListener("mouseup", _e => {
  window.clearTimeout(TIMEOUT_ID);
  TIMEOUT_ID = window.setTimeout(sendSelectedTextMessage, SELECTION_TIMEOUT);
});

function sendSelectedTextMessage(): void {
  const text = selectedText().trim();
  if (text) sendRead(text).catch(logError);
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
