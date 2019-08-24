/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEFAULT_VOICENAME }        from "./constants";
import BadgeCounter                 from "./counter";
import { logChromeErrorMessage }    from "./error";
import updateBrowserIcon            from "./icon";
import { getStorageOptions, store } from "./storage";

const BY_COMMON_PUNCTUATIONS = /[_.,:;!?<>/()—[\]{}]/gm;
const DEFAULT_RATE           = 1.2;
const DEFAULT_PITCH          = 0;
const DEFAULT_VOLUME         = 1;

const OPTIONS: chrome.tts.SpeakOptions = {
  pitch    : DEFAULT_PITCH,
  volume   : DEFAULT_VOLUME,
  rate     : DEFAULT_RATE,
  voiceName: DEFAULT_VOICENAME,
  enqueue  : true,
  onEvent  : (event: chrome.tts.TtsEvent): void => {
    chrome.tts.isSpeaking(
      (speaking: boolean) => updateBrowserIcon(speaking)
    );
    if (event.type === "error") logError(`Error: ${event.errorMessage}`);
    else if (event.type === "end") badgeCounter.decrement();
  }
};

const badgeCounter = new BadgeCounter();

function read(
  utterances: string,
  options: chrome.ttsEngine.SpeakOptions = OPTIONS
): void {
  utterances
    .split(BY_COMMON_PUNCTUATIONS)
    .map(phrase => phrase.trim())
    .filter(phrase => phrase.length)
    .forEach(phrase => speak(phrase, options));
}

function speak(phrase: string, options: chrome.ttsEngine.SpeakOptions): void {
  chrome.tts.speak(phrase, options, (): void => {
    logChromeErrorMessage();
  });
  badgeCounter.increment();
}

function logError(message: string): void {
  stop();
  console.error(message);
}

function stop(): void {
  chrome.tts.stop();
  badgeCounter.reset();
}

chrome.runtime.onStartup.addListener(() => resolveStorageConfigurations());

chrome.storage.onChanged.addListener((_changes, _namespace) => {
  resolveStorageConfigurations();
});

chrome.runtime.onInstalled.addListener(() => {
  resolveStorageConfigurations();
});

function resolveStorageConfigurations(): void {
  getStorageOptions()
    .then(result => updateSpeakOptionsFromStorage(result))
    .catch(_error => store(
      DEFAULT_VOICENAME,
      DEFAULT_RATE,
      DEFAULT_PITCH
    ));
}

function updateSpeakOptionsFromStorage(
  result: {
    rate: number | string;
    pitch: number | string;
    voiceName: string | number;
  }
): void {
  OPTIONS.rate      = result.rate as number;
  OPTIONS.pitch     = result.pitch as number;
  OPTIONS.voiceName = result.voiceName as string;
}

export { read, stop };
