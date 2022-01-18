import { logError } from "./error";

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

export async function messageToContentScript(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  func: (arg0: any, arg1: { tabId: number; }) => Promise<void>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): Promise<void> {
  return new Promise(_resolve => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      (tabs: chrome.tabs.Tab[]): void => {
        const tabid = tabs[0].id || -1;
        if (tabid < 0) return;
        func(data, { tabId: tabid }).catch(logError);
      }
    );
  });
}

export { getTtsVoices, isSpeaking };
