import updateBrowserIcon from "./icon";

const BY_COMMON_PUNCTUATIONS = /[_.,:;!?<>/()—[\]{}]/gm;

const OPTIONS: chrome.tts.SpeakOptions = {
  pitch  : 0,
  volume : 1,
  rate   : 1.5,
  lang   : "en-GB",
  enqueue: true,
  onEvent: (event: chrome.tts.TtsEvent): void => {
    chrome.tts.isSpeaking((speaking: boolean) => updateBrowserIcon(speaking));
    if (event.type === "error") console.log(`Error: ${event.errorMessage}`);
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
  chrome.tts.speak(phrase, options, logSpeakEventErrors);
}

function logSpeakEventErrors(): void {
  if (chrome.runtime.lastError)
    console.log(`Error: ${chrome.runtime.lastError.message}`);
}

function stop(): void {
  chrome.tts.stop();
}

export { read, stop };
