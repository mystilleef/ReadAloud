import { logChromeErrorMessage } from "./error";

const RATE              = "rate";
const VOICENAME         = "voiceName";
const PITCH             = "pitch";
const DEFAULT_VOICENAME = "Google UK English Female";

const setPitch = (pitch: number): void => {
  chrome.storage.sync.set({ pitch }, () => logChromeErrorMessage());
};

const setRate = (rate: number): void => {
  chrome.storage.sync.set({ rate }, () => logChromeErrorMessage());
};

const setVoiceName = (voiceName: string): void => {
  chrome.storage.sync.set({ voiceName }, () => logChromeErrorMessage());
};

export {
  RATE,
  PITCH,
  VOICENAME,
  DEFAULT_VOICENAME,
  setRate,
  setPitch,
  setVoiceName
};
