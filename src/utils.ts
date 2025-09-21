import { logChromeErrorMessage, logError } from "./error";

export interface EmptyData {
  data?: string;
}

async function getTtsVoices(): Promise<chrome.tts.TtsVoice[]> {
  return new Promise((resolve) => {
    chrome.tts.getVoices((voices) => resolve(voices));
  });
}

async function isSpeaking(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.tts.isSpeaking((speaking) => resolve(speaking));
  });
}

export async function speak(
  phrase: string,
  options: chrome.tts.TtsOptions,
): Promise<void> {
  await new Promise<void>(() => {
    chrome.tts.speak(phrase, options, logChromeErrorMessage);
  });
}

export async function resume(): Promise<void> {
  return new Promise(() => {
    chrome.tts.resume();
  });
}

export async function stop(): Promise<void> {
  return new Promise(() => {
    chrome.tts.stop();
  });
}

export async function pause(): Promise<void> {
  return new Promise(() => {
    chrome.tts.pause();
  });
}

export async function refresh(): Promise<void> {
  return new Promise(() => {
    chrome.tts.pause();
    chrome.tts.resume();
  });
}

export async function messageToContentScript(
  func: (_arg0: EmptyData, _arg1: { tabId: number }) => Promise<void>,
  data: EmptyData,
): Promise<void> {
  return new Promise(() => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      (tabs: chrome.tabs.Tab[]): void => {
        if (!tabs || !tabs[0]) return;
        const tabid = tabs[0].id || -1;
        if (tabid) func(data, { tabId: tabid }).catch(logError);
      },
    );
  });
}

export { getTtsVoices, isSpeaking };
