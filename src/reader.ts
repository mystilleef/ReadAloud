import updateBrowserIcon from "./icon";

// const BY_COMMON_PUNCTUATIONS = /[|(){}<>[\]_/—*.,~:;=!?]/gm;
const BY_COMMON_PUNCTUATIONS = /[_.,:;!?]/gm;

const OPTIONS: chrome.tts.SpeakOptions = {
  pitch  : 0,
  volume : 1,
  rate   : 1.5,
  lang   : "en-GB",
  enqueue: true,
  onEvent: (event: chrome.tts.TtsEvent): void => {
    chrome
      .tts
      .isSpeaking((speaking: boolean) => updateBrowserIcon(speaking));
    if (event.type === "error") console.log(`Error: ${event.errorMessage}`);
  }
};

function read(
  utterances: string,
  options: chrome.ttsEngine.SpeakOptions = OPTIONS
): void {
  const phrases = utterances.split(BY_COMMON_PUNCTUATIONS);
  phrases.forEach(
    phrase => chrome.tts.speak(phrase.trim(), options, logSpeakEventErrors)
  );
}

function logSpeakEventErrors(): void {
  if (chrome.runtime.lastError)
    console.log(`Error: ${chrome.runtime.lastError.message}`);
}

function stop(): void {
  chrome.tts.stop();
}

export { read, stop };
