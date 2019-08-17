const OPTIONS: chrome.tts.SpeakOptions = {
  pitch: 0,
  volume: 1,
  rate: 1.5,
  lang: "en-GB",
  enqueue: true,
  onEvent: logSpeechEvents
};

function read(
  utterances: string,
  options: chrome.ttsEngine.SpeakOptions = OPTIONS
): void {
  chrome.tts.speak(utterances, options, logSpeakError);
}

function logSpeakError(): void {
  if (chrome.runtime.lastError)
    console.log(`Error: ${chrome.runtime.lastError.message}`);
}

function logSpeechEvents(event: chrome.tts.TtsEvent): void {
  console.log(`Event ${event.type} at position ${event.charIndex})`);
  if (event.type === "error") console.log(`Error: ${event.errorMessage}`);
}

export { read as default };
