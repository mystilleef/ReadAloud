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
  func: (_arg0: unknown, _arg1: { tabId: number; }) => Promise<void>,
  data: unknown
): Promise<void> {
  return new Promise(_resolve => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      (tabs: chrome.tabs.Tab[]): void => {
        if (!tabs || !tabs[0]) return;
        const tabid = tabs[0].id || -1;
        if (tabid) func(data, { tabId: tabid }).catch(logError);
      }
    );
  });
}

export { getTtsVoices, isSpeaking };
