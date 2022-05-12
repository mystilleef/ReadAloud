import {
  messageToContentScript,
  refresh,
  speak,
  stop
} from "./utils";
import {
  sendEndSpeaking,
  sendFinishedSpeaking,
  sendStartedSpeaking
} from "./message";
import { logError } from "./error";

export async function readTts(
  utterances: string,
  options: chrome.ttsEngine.SpeakOptions
): Promise<void> {
  await refresh();
  await speak(utterances, options);
}

export async function refreshTts(): Promise<void> {
  await refresh();
}

export async function stopTts(): Promise<void> {
  await stop();
  await messageToContentScript(sendFinishedSpeaking, {});
}

export function onTtsEvent(event: chrome.tts.TtsEvent): void {
  onTts(event).catch(logError);
}

async function onTts(event: chrome.tts.TtsEvent): Promise<void> {
  await refresh();
  const errorMessage = event.errorMessage || "undefined";
  if (event.type === "start") await onStart();
  else if (event.type === "interrupted") await onInterrupted();
  else if (event.type === "end") await onEnd();
  else if (event.type === "error") await onError(`Error: ${errorMessage}`);
}

async function onStart(): Promise<void> {
  await messageToContentScript(sendStartedSpeaking, {});
}

async function onInterrupted(): Promise<void> {
  await messageToContentScript(sendFinishedSpeaking, {});
}

async function onEnd(): Promise<void> {
  await messageToContentScript(sendEndSpeaking, {});
}

async function onError(message: string): Promise<void> {
  await stopTts();
  await error(message);
}

async function error(message: string): Promise<void> {
  return new Promise(() => {
    logError(message);
  });
}

