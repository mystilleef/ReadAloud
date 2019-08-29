const getTtsVoices = async (): Promise<chrome.tts.TtsVoice[]> =>
  new Promise((resolve): void => chrome.tts.getVoices(resolve));

const isSpeaking = async (): Promise<boolean> =>
  new Promise(
    (
      (resolve): void => chrome.tts.isSpeaking(resolve)
    )
  );

export { getTtsVoices, isSpeaking };
