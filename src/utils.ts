async function getTtsVoices(): Promise<chrome.tts.TtsVoice[]> {
  return new Promise(resolve => {
    chrome.tts.getVoices(voices => resolve(voices));
  });
}

async function isSpeaking(): Promise<boolean> {
  return new Promise(resolve => {
    chrome.tts.isSpeaking(speaking => resolve(speaking));
  });
}

export {getTtsVoices, isSpeaking};
