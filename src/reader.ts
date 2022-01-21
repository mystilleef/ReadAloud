import { onTtsEvent, refreshTts as refresh, stopTts } from "./ttshandler";
import { getStorageOptions } from "./storage";
import { speak } from "./utils";

async function read(utterances: string): Promise<void> {
  await speak(utterances, await getSpeakOptions());
}

async function getSpeakOptions(): Promise<chrome.tts.SpeakOptions> {
  const { rate, pitch, voiceName } = await getStorageOptions();
  return {
    enqueue: true,
    onEvent: onTtsEvent,
    pitch,
    rate,
    voiceName,
    volume: 1
  };
}

export { read, stopTts, refresh };
