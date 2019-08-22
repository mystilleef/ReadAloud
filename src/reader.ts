import BadgeCounter      from "./counter";
import updateBrowserIcon from "./icon";

const BY_COMMON_PUNCTUATIONS = /[-_.,:;!?<>/()—[\]{}]/gm;

const badgeCounter = new BadgeCounter();

const DEFAULT_VOICENAME = "Google UK English Female";
const DEFAULT_RATE      = 1.2;
const DEFAULT_PITCH     = 0;
const DEFAULT_VOLUME    = 1;
const PITCH             = "pitch";
const RATE              = "rate";
const VOICENAME         = "voiceName";

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
        () => {}
      );
      else updateSpeakOptionsFromStorage();
    }
  );
}

function storageResultIsUndefined(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: { [p: string]: any }
): boolean {
  return result.pitch === undefined
         || result.rate === undefined
         || result.voiceName === undefined;
}

function updateSpeakOptionsFromStorage(): void {
  chrome.storage.sync.get(
    [PITCH, RATE, VOICENAME],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result: { [key: string]: any }) => {
      OPTIONS.rate      = result.rate;
      OPTIONS.pitch     = result.pitch;
      OPTIONS.voiceName = result.voiceName;
      console.log(
        `
        Pitch: ${result.pitch},
        Rate: ${result.rate},
        VoiceName: ${result.voiceName}
        `
      );
    }
  );
}

function setPitch(pitch: number): void {
  chrome.storage.sync.set({ pitch }, () => {});
}

function setRate(rate: number): void {
  chrome.storage.sync.set({ rate }, () => {});
}

function setVoiceName(voiceName: string): void {
  chrome.storage.sync.set({ voiceName }, () => {});
}

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
    if (chrome.runtime.lastError)
      logError(`Error: ${chrome.runtime.lastError.message}`);
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
