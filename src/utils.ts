async function getTtsVoices(): Promise<chrome.tts.TtsVoice[]> {
  return new Promise(
    (resolve): void => chrome.tts.getVoices(resolve)
  );
}

async function isSpeaking(): Promise<boolean> {
  return new Promise(
    (resolve): void => chrome.tts.isSpeaking(resolve)
  );
}

export { getTtsVoices, isSpeaking };
