import BadgeCounter      from "./counter";
import updateBrowserIcon from "./icon";

const BY_COMMON_PUNCTUATIONS = /[-_.,:;!?<>/()—[\]{}]/gm;

const badgeCounter = new BadgeCounter();

const OPTIONS: chrome.tts.SpeakOptions = {
  pitch  : 0,
  volume : 1,
  rate   : 1.5,
  lang   : "en-GB",
  enqueue: true,
  onEvent: (event: chrome.tts.TtsEvent): void => {
    chrome.tts.isSpeaking(
      (speaking: boolean) => updateBrowserIcon(speaking)
    );
    if (event.type === "error") logError(`Error: ${event.errorMessage}`);
    else if (event.type === "end") badgeCounter.decrement();
  }
};

chrome.storage.onChanged.addListener((_changes, _namespace) => {
  updateSpeakOptionsFromStorage();
});

chrome.runtime.onStartup.addListener(() => {
  updateSpeakOptionsFromStorage();
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ pitch: 0, rate: 1.5, lang: "en-GB" }, () => {
    // Set default speak options.
  });
});

function updateSpeakOptionsFromStorage(): void {
  chrome.storage.sync.get(
    ["pitch", "rate", "lang"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result: { [key: string]: any }) => {
      OPTIONS.rate  = result.rate;
      OPTIONS.pitch = result.pitch;
      OPTIONS.lang  = result.lang;
      console.log(
        `Pitch: ${result.pitch}, Rate: ${result.rate}, Lang: ${result.lang}`
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

function setLang(lang: string): void {
  chrome.storage.sync.set({ lang }, () => {});
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

export { read, stop, setLang, setPitch, setRate };
