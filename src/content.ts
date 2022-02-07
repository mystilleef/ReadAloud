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
import { EXTENSION_ID } from "./constants";
import { logError } from "./error";

const REFRESH_TTS_TIMEOUT = 3000;
const SELECTION_TIMEOUT = 1000;
const FINISH_TTS_TIMEOUT = 5000;

let REFRESH_TTS_TIMEOUT_ID = 0;
let FINISH_TTS_TIMEOUT_ID = 0;
let SELECTION_TIMEOUT_ID = 0;

startedSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id !== EXTENSION_ID) return;
  stopFinishTimer();
  startRefreshTimer();
  sendGotStartedSpeaking({}).catch(logError);
});

endSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id !== EXTENSION_ID) return;
  stopRefreshTimer();
  sendGotEndSpeaking({}).catch(logError);
  startFinishTimer();
});

finishedSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id !== EXTENSION_ID) return;
  stopRefreshTimer();
  sendGotFinishedSpeaking({}).catch(logError);
});

selectedTextStream.subscribe(([_data, sender]) => {
  if (sender.id !== EXTENSION_ID) return;
  sendSelectedTextMessage();
});

document.onselectionchange = () => {
  window.clearTimeout(SELECTION_TIMEOUT_ID);
  SELECTION_TIMEOUT_ID =
    window.setTimeout(sendSelectedTextMessage, SELECTION_TIMEOUT);
};

function sendSelectedTextMessage(): void {
  const selectedText = window.getSelection()?.toString();
  if (!selectedText) return;
  stopFinishTimer();
  startRefreshTimer();
  sendRead(selectedText).catch(logError);
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

