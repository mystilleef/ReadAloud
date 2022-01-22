import {
  endSpeakingStream,
  finishedSpeakingStream,
  selectedTextStream,
  sendGotEndSpeaking,
  sendGotFinishedSpeaking,
  sendGotStartedSpeaking,
  sendRead,
  sendRefreshTts,
  startedSpeakingStream
} from "./message";
import { logError } from "./error";

const REFRESH_TTS_TIMEOUT = 3000;
const SELECTION_TIMEOUT = 1000;
const FINISH_TTS_TIMEOUT = 1000;

let REFRESH_TTS_TIMEOUT_ID = 0;
let FINISH_TTS_TIMEOUT_ID = 0;
let SELECTION_TIMEOUT_ID = 0;

startedSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id !== chrome.runtime.id) return;
  stopFinishTimer();
  startRefreshTimer();
  sendGotStartedSpeaking({}).catch(logError);
});

endSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id !== chrome.runtime.id) return;
  stopRefreshTimer();
  sendGotEndSpeaking({}).catch(logError);
  startFinishTimer();
});

finishedSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id !== chrome.runtime.id) return;
  stopRefreshTimer();
  sendGotFinishedSpeaking({}).catch(logError);
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
  if (selectedText) sendRead(selectedText).catch(logError);
}

function startRefreshTimer() {
  stopRefreshTimer();
  REFRESH_TTS_TIMEOUT_ID = window.setInterval(() => {
    sendRefreshTts({}).catch(logError);
  }, REFRESH_TTS_TIMEOUT);
}

function stopRefreshTimer() {
  window.clearTimeout(REFRESH_TTS_TIMEOUT_ID);
}

function startFinishTimer() {
  stopFinishTimer();
  FINISH_TTS_TIMEOUT_ID = window.setTimeout(() => {
    sendGotFinishedSpeaking({}).catch(logError);
  }, FINISH_TTS_TIMEOUT);
}

function stopFinishTimer() {
  window.clearTimeout(FINISH_TTS_TIMEOUT_ID);
}

