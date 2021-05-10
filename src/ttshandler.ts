import badgeCounter from "./counter";
import { logError } from "./error";
import updateBrowserIcon from "./icon";
import { isSpeaking } from "./utils";

let TIMEOUT_RESUME_SPEAKING = 0;

export function onTtsEvent(event: chrome.tts.TtsEvent): void {
  resetTts();
  isSpeaking().then(updateBrowserIcon).catch(logError);
  handleTtsEvent(event);
}

function handleTtsEvent(event: chrome.tts.TtsEvent): void {
  if (event.type === "error") handleError(`Error: ${event.errorMessage}`);
  else if (event.type === "start") handleStart();
  else if (event.type === "end") handleEnd();
}

function handleError(message: string): void {
  stop();
  logError(message);
}

function handleStart() {
  resetTts();
  resumeSpeaking();
  resetTts();
}

function handleEnd() {
  stopSpeaking();
  badgeCounter.decrement();
}

function resumeSpeaking() {
  resetTts();
  TIMEOUT_RESUME_SPEAKING = window.setTimeout(resumeSpeaking, 5000);
}

function stopSpeaking() {
  resetTts();
  clearTimeout(TIMEOUT_RESUME_SPEAKING);

}

export function resetTts(): void {
  chrome.tts.pause();
  chrome.tts.resume();
}

export function stop(): void {
  chrome.tts.pause();
  chrome.tts.stop();
  badgeCounter.reset();
}
