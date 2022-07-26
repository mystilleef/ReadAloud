import { debounceTime, throttleTime } from "rxjs";
import {
  endedSpeakingStream,
  finishedSpeakingStream,
  selectedTextStream,
  sendGotEndSpeaking,
  sendGotFinishedSpeaking,
  sendRead,
  sendRefreshTts,
  startedSpeakingStream
} from "./message";
import { EXTENSION_ID } from "./constants";
import { logError } from "./error";

const ONE_SECOND_TIMEOUT = 1000;
const REFRESH_TTS_TIMEOUT = 5000;
const STREAM_TIMEOUT = 1000;

let REFRESH_TTS_TIMEOUT_ID = 0;
let SELECTION_TIMEOUT_ID = 0;

startedSpeakingStream
  .pipe(throttleTime(STREAM_TIMEOUT))
  .pipe(debounceTime(STREAM_TIMEOUT))
  .subscribe(([_data, sender]) => {
    if (sender.id !== EXTENSION_ID) return;
    startRefreshTimer();
  });

endedSpeakingStream
  .pipe(throttleTime(STREAM_TIMEOUT))
  .pipe(debounceTime(STREAM_TIMEOUT))
  .subscribe(([_data, sender]) => {
    if (sender.id !== EXTENSION_ID) return;
    stopRefreshTimer();
    sendGotEndSpeaking({}).catch(logError);
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
    window.setTimeout(sendSelectedTextMessage, ONE_SECOND_TIMEOUT);
};

function sendSelectedTextMessage(): void {
  const selectedText = window.getSelection()?.toString();
  if (!selectedText) return;
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

