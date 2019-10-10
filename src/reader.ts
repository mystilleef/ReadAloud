import badgeCounter from "./counter";
import { logChromeErrorMessage } from "./error";
import { getStorageOptions } from "./storage";
import { onTtsEvent, stop } from "./ttshandler";

const BY_COMMON_PUNCTUATIONS = /[_.,:;!?<>/()—[\]{}]/gm;

async function read(utterances: string): Promise<void> {
  const speakOptions = await getSpeakOptions();
  utterances
    .split(BY_COMMON_PUNCTUATIONS)
    .map(phrase => phrase.trim())
    .filter(phrase => phrase.length)
    .forEach(phrase => speak(phrase, speakOptions));
}

async function getSpeakOptions(): Promise<chrome.tts.SpeakOptions> {
  const { rate, pitch, voiceName } = await getStorageOptions();
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
  chrome.tts.speak(phrase, options, logChromeErrorMessage);
  badgeCounter.increment();
}

export { read, stop };
