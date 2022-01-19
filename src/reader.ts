import { logChromeErrorMessage, logError } from "./error";
import { onTtsEvent, resetTts as refresh, stop } from "./ttshandler";
import badgeCounter from "./counter";
import { getStorageOptions } from "./storage";

async function read(utterances: string): Promise<void> {
  await speak(utterances, await getSpeakOptions());
}

async function speak(
  phrase: string,
  options: chrome.ttsEngine.SpeakOptions
): Promise<void> {
  await new Promise<void>((_resolve, _reject) => {
    chrome.tts.speak(phrase, options, logChromeErrorMessage);
    badgeCounter.increment().catch(logError);
  });
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

export { read, stop, refresh };
