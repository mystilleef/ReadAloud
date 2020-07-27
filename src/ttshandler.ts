import badgeCounter from "./counter";
import { logError } from "./error";
import updateBrowserIcon from "./icon";
import { isSpeaking } from "./utils";

export function onTtsEvent(event: chrome.tts.TtsEvent): void {
  isSpeaking().then(updateBrowserIcon).catch(logError);
  handleTtsEvent(event);
}

function handleTtsEvent(event: chrome.tts.TtsEvent): void {
  if (event.type === "error") handleError(`Error: ${event.errorMessage}`);
  else if (event.type === "end") badgeCounter.decrement();
}

function handleError(message: string): void {
  stop();
  logError(message);
}

export function stop(): void {
  chrome.tts.stop();
  badgeCounter.reset();
}
