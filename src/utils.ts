async function getTtsVoices(): Promise<chrome.tts.TtsVoice[]> {
  return new Promise((resolve): void => {
    chrome.tts.getVoices(
      (voices: chrome.tts.TtsVoice[]) => resolve(voices)
    );
  });
}

export { getTtsVoices as default };
