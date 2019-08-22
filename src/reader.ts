/* eslint-disable @typescript-eslint/no-explicit-any */
import BadgeCounter              from "./counter";
import { logChromeErrorMessage } from "./error";
import updateBrowserIcon         from "./icon";

const DEFAULT_VOICENAME = "Google UK English Female";
const PITCH             = "pitch";
const RATE              = "rate";
const VOICENAME         = "voiceName";

const BY_COMMON_PUNCTUATIONS = /[-_.,:;!?<>/()—[\]{}]/gm;
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

chrome.storage.onChanged.addListener((_changes, _namespace) => {
  resolveStorageConfigurations();
});

chrome.runtime.onStartup.addListener(() => {
  resolveStorageConfigurations();
});

chrome.runtime.onInstalled.addListener(() => {
  resolveStorageConfigurations();
});

function resolveStorageConfigurations(): void {
  chrome.storage.sync.get(
    [PITCH, RATE, VOICENAME],
    result => {
      if (storageResultIsUndefined(result)) chrome.storage.sync.set(
        {
          pitch    : DEFAULT_PITCH,
          rate     : DEFAULT_RATE,
          voiceName: DEFAULT_VOICENAME
        },
        () => logChromeErrorMessage()
      );
      else updateSpeakOptionsFromStorage();
    }
  );
}

function storageResultIsUndefined(
  result: { [p: string]: any }
): boolean {
  return result.pitch === undefined
         || result.rate === undefined
         || result.voiceName === undefined;
}

function updateSpeakOptionsFromStorage(): void {
  chrome.storage.sync.get(
    [PITCH, RATE, VOICENAME],
    (result: { [key: string]: any }) => {
      OPTIONS.rate      = result.rate;
      OPTIONS.pitch     = result.pitch;
      OPTIONS.voiceName = result.voiceName;
    }
  );
}

const setPitch = (pitch: number): void => {
  chrome.storage.sync.set({ pitch }, () => {});
};

const setRate = (rate: number): void => {
  chrome.storage.sync.set({ rate }, () => {});
};

const setVoiceName = (voiceName: string): void => {
  chrome.storage.sync.set({ voiceName }, () => {});
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

function logError(message: string): void {
  stop();
  console.error(message);
}

function stop(): void {
  chrome.tts.stop();
  badgeCounter.reset();
}

export {
  RATE,
  PITCH,
  VOICENAME,
  DEFAULT_VOICENAME,
  read,
  stop,
  setRate,
  setPitch,
  setVoiceName
};
