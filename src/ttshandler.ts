import {
  stop as chromettsstop,
  isSpeaking,
  messageToContentScript,
  refresh
} from "./utils";
import {
  sendEndSpeaking,
  sendFinishedSpeaking,
  sendStartedSpeaking
} from "./message";
import { logError } from "./error";
import updateBrowserIcon from "./icon";

export function onTtsEvent(event: chrome.tts.TtsEvent): void {
  isSpeaking().then(updateBrowserIcon).catch(logError);
  onTts(event).catch(logError);
}

async function onTts(event: chrome.tts.TtsEvent): Promise<void> {
  const errorMessage = event.errorMessage || "undefined";
  if (event.type === "error") await onError(`Error: ${errorMessage}`);
  else if (event.type === "start") await onStart();
  else if (event.type === "interrupted") await onInterrupted();
  else if (event.type === "end") await onEnd();
}

async function onError(message: string): Promise<void> {
  await log(message);
  await stop();
}

async function log(message: string): Promise<void> {
  return new Promise(_resolve => {
    logError(message);
  });
}

export async function stop(): Promise<void> {
  await chromettsstop();
  await messageToContentScript(sendFinishedSpeaking, {});
}

async function onStart(): Promise<void> {
  await messageToContentScript(sendStartedSpeaking, {});
}

async function onInterrupted(): Promise<void> {
  await messageToContentScript(sendEndSpeaking, {});
}

async function onEnd(): Promise<void> {
  await messageToContentScript(sendEndSpeaking, {});
}

export async function resetTts(): Promise<void> {
  if (await isSpeaking()) await refreshTts();
}

async function refreshTts(): Promise<void> {
  await refresh();
}

