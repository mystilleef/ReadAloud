import {
  selectedTextStream,
  sendRead,
  sendRefreshTts,
  sendTimeout,
  startedSpeakingStream,
  stoppedSpeakingStream
} from "./message";
import { logError } from "./error";

const REFRESH_TTS_TIMEOUT = 10000;
const RESET_TIMEOUT = 300000;
const SELECTION_TIMEOUT = 1000;

let REFRESH_TTS_TIMEOUT_ID = 0;
let RESET_TIMEOUT_ID = 0;
let SELECTION_TIMEOUT_ID = 0;

startedSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id !== chrome.runtime.id) return;
  startTimeoutTimer();
  startRefreshTimer();
});

stoppedSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id !== chrome.runtime.id) return;
  stopTimeoutTimer();
  stopRefreshTimer();
});

selectedTextStream.subscribe(([_data, sender]) => {
  if (sender.id !== chrome.runtime.id) return;
  sendSelectedTextMessage();
});

document.addEventListener("mouseup", _e => {
  window.clearTimeout(SELECTION_TIMEOUT_ID);
  SELECTION_TIMEOUT_ID =
    window.setTimeout(sendSelectedTextMessage, SELECTION_TIMEOUT);
});

function sendSelectedTextMessage(): void {
  const selectedText = window.getSelection()?.toString();
  if (!selectedText) return;
  sendRead(selectedText).catch(logError);
  startTimeoutTimer();
}

function startRefreshTimer() {
  stopRefreshTimer();
  REFRESH_TTS_TIMEOUT_ID = window.setInterval(() => {
    sendRefreshTts("").catch(logError);
  }, REFRESH_TTS_TIMEOUT);
}

function stopRefreshTimer() {
  window.clearTimeout(REFRESH_TTS_TIMEOUT_ID);
}

function startTimeoutTimer() {
  stopTimeoutTimer();
  RESET_TIMEOUT_ID = window.setInterval(() => {
    sendTimeout("").catch(logError);
  }, RESET_TIMEOUT);
}

function stopTimeoutTimer() {
  window.clearTimeout(RESET_TIMEOUT_ID);
}

