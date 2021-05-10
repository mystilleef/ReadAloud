import badgeCounter from "./counter";
import { logChromeErrorMessage } from "./error";
import { getStorageOptions } from "./storage";
import { onTtsEvent, resetTts, stop } from "./ttshandler";

async function read(utterances: string): Promise<void> {
  const speakOptions = await getSpeakOptions();
  speak(utterances, speakOptions);
}

async function getSpeakOptions(): Promise<chrome.tts.SpeakOptions> {
  const { rate, pitch, voiceName } = await getStorageOptions();
  resetTts();
  return {
    pitch    : pitch as number,
    rate     : rate as number,
    voiceName: voiceName as string,
    volume   : 1,
    enqueue  : true,
    onEvent  : onTtsEvent
  };
}

function speak(phrase: string, options: chrome.ttsEngine.SpeakOptions): void {
  resetTts();
  chrome.tts.speak(phrase, options, logChromeErrorMessage);
  badgeCounter.increment();
}

export { read, stop };
