import BadgeCounter from "./counter";
import { logChromeErrorMessage, logError } from "./error";
import updateBrowserIcon from "./icon";
import { getStorageOptions } from "./storage";
import { isSpeaking } from "./utils";

const BY_COMMON_PUNCTUATIONS = /[_.,:;!?<>/()—[\]{}]/gm;
const badgeCounter           = new BadgeCounter();

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

function onTtsEvent(event: chrome.tts.TtsEvent): void {
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

function stop(): void {
  chrome.tts.stop();
  badgeCounter.reset();
}

function speak(phrase: string, options: chrome.ttsEngine.SpeakOptions): void {
  chrome.tts.speak(phrase, options, logChromeErrorMessage);
  badgeCounter.increment();
}

export { read, stop };
