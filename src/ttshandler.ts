import badgeCounter from "./counter";
import updateBrowserIcon from "./icon";
import { isSpeaking } from "./utils";
import { logError } from "./error";

let TIMEOUT_RESUME_SPEAKING = 0;
const RESET_INTERVAL = 5000;

export function onTtsEvent(event: chrome.tts.TtsEvent): void {
  isSpeaking().then(updateBrowserIcon).catch(logError);
  onTts(event);
}

function onTts(event: chrome.tts.TtsEvent): void {
  if (event.type === "error") onError(`Error: ${event.errorMessage}`);
  else if (event.type === "start") onStart();
  else if (event.type === "interrupted") onInterrupted();
  else if (event.type === "end") onEnd();
}

function onError(message: string): void {
  stop();
  logError(message);
}

export function stop(): void {
  stopTtsTimer();
  chrome.tts.stop();
  badgeCounter.reset().catch(logError);
}

function onStart() {
  stopTtsTimer();
  resumeTtsTimer();
  refreshTts();
}

function onInterrupted() {
  refreshTts();
  resumeTtsTimer();
}

function onEnd() {
  stopTtsTimer();
  badgeCounter.decrement().catch(logError);
  refreshTts();
}

function resumeTtsTimer() {
  TIMEOUT_RESUME_SPEAKING = window.setInterval(resetTts, RESET_INTERVAL);
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
