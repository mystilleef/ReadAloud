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

function read(
  utterances: string,
  options: chrome.ttsEngine.SpeakOptions = getSpeakOptionsFromStorage()
): void {
  utterances
    .split(BY_COMMON_PUNCTUATIONS)
    .map(phrase => phrase.trim())
    .filter(phrase => phrase.length)
    .forEach(phrase => speak(phrase, options));
}

function getSpeakOptionsFromStorage(): chrome.ttsEngine.SpeakOptions {
  // OPTIONS.rate = 1.5;
  return OPTIONS;
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

export { read, stop };
