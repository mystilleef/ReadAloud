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
  else if (event.type === "end") handleEnd();
}

function handleError(message: string): void {
  stop();
  logError(message);
}

function handleStart() {
  resumeSpeaking();
}

function handleEnd() {
  stopSpeaking();
  badgeCounter.decrement();
}

function resumeSpeaking() {
  chrome.tts.pause();
  chrome.tts.resume();
  TIMEOUT_RESUME_SPEAKING = window.setTimeout(resumeSpeaking, 10000);
}

function stopSpeaking() {
  clearTimeout(TIMEOUT_RESUME_SPEAKING);
}

export function stop(): void {
  chrome.tts.stop();
  badgeCounter.reset();
}
