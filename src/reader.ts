import {
  DEFAULT_PITCH,
  DEFAULT_RATE,
  DEFAULT_VOICENAME,
  VoiceStorageOptions
} from "./constants";
import BadgeCounter from "./counter";
import { logChromeErrorMessage, logError } from "./error";
import updateBrowserIcon from "./icon";
import { getStorageOptions, storeDefaultOptions } from "./storage";

const BY_COMMON_PUNCTUATIONS = /[_.,:;!?<>/()—[\]{}]/gm;

const badgeCounter = new BadgeCounter();

const DEFAULT_OPTIONS = {
  pitch    : DEFAULT_PITCH,
  rate     : DEFAULT_RATE,
  voiceName: DEFAULT_VOICENAME,
  volume   : 1,
  enqueue  : true
};

const OPTIONS: chrome.tts.SpeakOptions = {
  ...DEFAULT_OPTIONS,
  onEvent: (event: chrome.tts.TtsEvent): void => {
    isSpeaking().then(speaking => updateBrowserIcon(speaking));
    if (event.type === "error") error(`Error: ${event.errorMessage}`);
    else if (event.type === "end") badgeCounter.decrement();
  }
};

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

function error(message: string): void {
  stop();
  logError(message);
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
    .then(result => updateOptions(result))
    .catch(_error => storeDefaultOptions());
}

function updateOptions(result: VoiceStorageOptions): void {
  OPTIONS.rate      = result.rate as number;
  OPTIONS.pitch     = result.pitch as number;
  OPTIONS.voiceName = result.voiceName as string;
}

async function isSpeaking(): Promise<boolean> {
  return new Promise((
    (resolve): void => {
      chrome.tts.isSpeaking(speaking => resolve(speaking));
    }
  ));
}

export { read, stop };
