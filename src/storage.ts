import {
  DEFAULT_PITCH,
  DEFAULT_RATE,
  DEFAULT_VOICENAME,
  PITCH,
  RATE,
  VOICENAME
}                                                    from "./constants";
import { chromeRuntimeError, logChromeErrorMessage } from "./error";

const storageKeys = [PITCH, VOICENAME, RATE];

async function getStorageOptions(): Promise<{
  rate: number | string;
  pitch: number | string;
  voiceName: string | number;
}> {
  const rate      = await getRate();
  const pitch     = await getPitch();
  const voiceName = await getVoiceName();
  return { rate, pitch, voiceName };
}

async function getVoiceName(): Promise<string | number> {
  return getValueFromStorage(VOICENAME);
}

async function getPitch(): Promise<string | number> {
  return getValueFromStorage(PITCH);
}

async function getRate(): Promise<string | number> {
  return getValueFromStorage(RATE);
}

async function getValueFromStorage(key: string): Promise<string | number> {
  return new Promise((resolve, reject): void => {
    if (storageKeys.includes(key))
      valueFromChromeStorage(key, resolve, reject);
    else
      reject(new Error(`${key} is not a valid keystore`));
  });
}

function valueFromChromeStorage(
  key: string,
  resolve: {
    (value?: string | number | PromiseLike<string | number>): void;
    (arg0: string | number): void;
  },
  reject: { (reason?: string): void; (arg0: Error): void }
): void {
  chrome.storage.sync.get(key, item => {
    if (valueDoesNotExist(item[key]))
      reject(new Error(`${item[key]} does not exist`));
    else
      resolve(item[key]);
  });
}

function valueDoesNotExist(value: string): boolean {
  return value === undefined || value === null;
}

async function storeDefaultOptions(): Promise<void> {
  await store(DEFAULT_VOICENAME, DEFAULT_RATE, DEFAULT_PITCH);
}

async function store(
  voiceName: string,
  rate: number,
  pitch: number
): Promise<void> {
  await storeValue({ rate, pitch, voiceName });
}

async function storeVoice(
  voiceName: string
): Promise<{ rate?: number; pitch?: number; voiceName?: string }> {
  return storeValue({ voiceName });
}

async function storeRate(
  rate: number
): Promise<{ rate?: number; pitch?: number; voiceName?: string }> {
  return storeValue({ rate });
}

async function storePitch(
  pitch: number
): Promise<{ rate?: number; pitch?: number; voiceName?: string }> {
  return storeValue({ pitch });
}

async function storeValue(
  info: { rate?: number; pitch?: number; voiceName?: string }
): Promise<{ rate?: number; pitch?: number; voiceName?: string }> {
  return new Promise((resolve, reject): void => {
    chrome.storage.sync.set(info, () => {
      if (chromeRuntimeError()) chromeErrorMessage(reject, info);
      else resolve(info);
    });
  });
}

function chromeErrorMessage(
  reject: { (reason?: string): void; (arg0: Error): void },
  info: { rate?: number; pitch?: number; voiceName?: string }
): void {
  logChromeErrorMessage();
  reject(new Error(`Error: Failed to set ${info}`));
}

export {
  getVoiceName,
  getRate,
  getPitch,
  getStorageOptions,
  storeVoice,
  storePitch,
  storeRate,
  store,
  storeDefaultOptions
};
