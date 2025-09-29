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

export function speak(
  phrase: string,
  options: chrome.tts.TtsOptions,
): Promise<void> {
  return new Promise((resolve) => {
    chrome.tts.speak(phrase, options, () => {
      logChromeErrorMessage();
      resolve();
    });
  });
}

export function resume(): Promise<void> {
  return new Promise((resolve) => {
    chrome.tts.resume();
    resolve();
  });
}

export function stop(): Promise<void> {
  return new Promise((resolve) => {
    chrome.tts.stop();
    resolve();
  });
}

export function pause(): Promise<void> {
  return new Promise((resolve) => {
    chrome.tts.pause();
    resolve();
  });
}

export function refresh(): Promise<void> {
  return new Promise((resolve) => {
    chrome.tts.pause();
    chrome.tts.resume();
    resolve();
  });
}

export function messageToContentScript(
  func: (_arg0: EmptyData, _arg1: { tabId: number }) => Promise<void>,
  data: EmptyData,
): Promise<void> {
  return new Promise((resolve) => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      (tabs: chrome.tabs.Tab[]): void => {
        if (tabs?.[0]?.id) {
          const tabid = tabs[0].id;
          func(data, { tabId: tabid }).catch(logError);
        }
        resolve();
      },
    );
  });
}

export { getTtsVoices, isSpeaking };
