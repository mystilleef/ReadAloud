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
const badgeCounter           = new BadgeCounter();
const DEFAULT_VOLUME         = 1;
const DEFAULT_QUEUE          = true;

const DEFAULT_OPTIONS = {
  pitch    : DEFAULT_PITCH,
  rate     : DEFAULT_RATE,
  voiceName: DEFAULT_VOICENAME,
  volume   : DEFAULT_VOLUME,
  enqueue  : DEFAULT_QUEUE
};

const OPTIONS: chrome.tts.SpeakOptions = {
  ...DEFAULT_OPTIONS,
  onEvent: (event: chrome.tts.TtsEvent): void => {
    isSpeaking().then(speaking => updateBrowserIcon(speaking));
    if (event.type === "error") error(`Error: ${event.errorMessage}`);
    else if (event.type === "end") badgeCounter.decrement();
  }
};

async function read(utterances: string): Promise<void> {
  await resolveStorageConfigurations();
  utterances
    .split(BY_COMMON_PUNCTUATIONS)
    .map(phrase => phrase.trim())
    .filter(phrase => phrase.length)
    .forEach(phrase => speak(phrase, OPTIONS));
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

async function resolveStorageConfigurations(): Promise<void> {
  try {
    updateOptions(await getStorageOptions());
  } catch (e) {
    await storeDefaultOptions();
  }
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
