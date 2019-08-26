async function getTtsVoices(): Promise<chrome.tts.TtsVoice[]> {
  return new Promise((resolve): void => {
    chrome.tts.getVoices(
      (voices: chrome.tts.TtsVoice[]) => resolve(voices)
    );
  });
}

async function isSpeaking(): Promise<boolean> {
  return new Promise((
    (resolve): void => {
      chrome.tts.isSpeaking(speaking => resolve(speaking));
    }
  ));
}

export { getTtsVoices, isSpeaking };
