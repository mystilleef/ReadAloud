import badgeCounter from "./counter";
import { logError } from "./error";
import updateBrowserIcon from "./icon";
import { isSpeaking } from "./utils";

let TIMEOUT_RESUME_SPEAKING = 0;

export function onTtsEvent(event: chrome.tts.TtsEvent): void {
  isSpeaking().then(updateBrowserIcon).catch(logError);
  handleTtsEvent(event);
}

function handleTtsEvent(event: chrome.tts.TtsEvent): void {
  if (event.type === "error") handleError(`Error: ${event.errorMessage}`);
  else if (event.type === "start") handleStart();
  else if (event.type === "interrupted") handleInterrupted();
  else if (event.type === "end") handleEnd();
}

function handleError(message: string): void {
  stop();
  logError(message);
}

function handleStart() {
  stopTtsTimer();
  resumeTtsTimer();
  refreshTts();
}

function handleEnd() {
  stopTtsTimer();
  badgeCounter.decrement().catch(logError);
  refreshTts();
}

function resumeTtsTimer() {
  TIMEOUT_RESUME_SPEAKING = window.setInterval(resetTts, 5000);
}

function stopTtsTimer() {
  clearTimeout(TIMEOUT_RESUME_SPEAKING);
}

function resetTts(): void {
  isSpeaking().then(refreshTts).catch(logError);
}

function refreshTts(_speaking = false): void {
  chrome.tts.pause();
  chrome.tts.resume();
}

export function stop(): void {
  stopTtsTimer();
  chrome.tts.stop();
  badgeCounter.reset().catch(logError);
}

function handleInterrupted() {
  console.log("chrome tts interrupted");
  refreshTts();
  resumeTtsTimer();
}
