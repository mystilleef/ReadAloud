import badgeCounter from "./counter";
import updateBrowserIcon from "./icon";
import { isSpeaking, messageToContentScript } from "./utils";
import { logError } from "./error";
import { sendStartedSpeaking, sendStoppedSpeaking } from "./message";

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
  chrome.tts.stop();
  badgeCounter.reset().catch(logError);
  messageToContentScript(sendStoppedSpeaking, "").catch(logError);
}

function onStart() {
  messageToContentScript(sendStartedSpeaking, "").catch(logError);
}

function onInterrupted() {
  messageToContentScript(sendStoppedSpeaking, "").catch(logError);
}

function onEnd() {
  badgeCounter.decrement().catch(logError);
  messageToContentScript(sendStoppedSpeaking, "").catch(logError);
}

export function resetTts(): void {
  isSpeaking().then(refreshTts).catch(logError);
}

function refreshTts(_speaking = false): void {
  chrome.tts.pause();
  chrome.tts.resume();
}
