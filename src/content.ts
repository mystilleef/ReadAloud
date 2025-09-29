import { EXTENSION_ID } from "./constants";
import { logError } from "./error";
import {
  endedSpeakingStream,
  selectedTextStream,
  sendGotEndSpeaking,
  sendRead,
  sendRefreshTts,
  startedSpeakingStream,
} from "./message";

const SELECTION_TIMEOUT = 500;
const REFRESH_TTS_TIMEOUT = 5000;

let REFRESH_TTS_TIMEOUT_ID: number | undefined;
let SELECTION_TIMEOUT_ID: number | undefined;

startedSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id !== EXTENSION_ID) return;
  startRefreshTimer();
});

function startRefreshTimer() {
  stopRefreshTimer();
  REFRESH_TTS_TIMEOUT_ID = window.setInterval(() => {
    sendRefreshTts({}).catch(logError);
  }, REFRESH_TTS_TIMEOUT);
}

endedSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id !== EXTENSION_ID) return;
  stopRefreshTimer();
  sendGotEndSpeaking({}).catch(logError);
});

function stopRefreshTimer() {
  if (REFRESH_TTS_TIMEOUT_ID) {
    window.clearTimeout(REFRESH_TTS_TIMEOUT_ID);
    REFRESH_TTS_TIMEOUT_ID = undefined;
  }
}

document.onselectionchange = () => {
  if (SELECTION_TIMEOUT_ID) {
    window.clearTimeout(SELECTION_TIMEOUT_ID);
    SELECTION_TIMEOUT_ID = undefined;
  }
  SELECTION_TIMEOUT_ID = window.setTimeout(
    sendSelectedTextMessage,
    SELECTION_TIMEOUT,
  );
};

selectedTextStream.subscribe(([_data, sender]) => {
  if (sender.id !== EXTENSION_ID) return;
  sendSelectedTextMessage();
});

function sendSelectedTextMessage(): void {
  const selectedText = window.getSelection()?.toString();
  if (!selectedText) return;
  sendRead(selectedText).catch(logError);
}
