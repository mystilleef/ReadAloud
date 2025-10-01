import {
  onTtsEvent,
  refreshTts as refresh,
  stopTts as stop,
} from "./ttshandler";
import { speak } from "./utils";

async function read(
  phrase: string,
  options: chrome.tts.TtsOptions,
): Promise<void> {
  const ttsoptions = { ...options, onEvent: onTtsEvent };
  await speak(phrase, ttsoptions);
}

async function readPhrases(
  phrases: string[],
  options: chrome.tts.TtsOptions,
): Promise<void> {
  for (const phrase of phrases) {
    await read(phrase, options);
  }
}

export { read, readPhrases, stop, refresh };
