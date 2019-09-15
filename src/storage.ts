import { PITCH, RATE, VOICENAME } from "./constants";
import { chromeRuntimeError, logChromeErrorMessage } from "./error";

const DEFAULT_RATE      = 1.2;
const DEFAULT_PITCH     = 0;
const DEFAULT_VOICENAME = "Google UK English Female";
const STORAGE_KEYS      = [PITCH, VOICENAME, RATE];

export interface VoiceStorageOptions {
  readonly [index: string]: number | string | undefined;

  readonly rate?: number;
  readonly pitch?: number;
  readonly voiceName?: string;
}

async function getStorageOptions(): Promise<VoiceStorageOptions> {
  const rate      = await getRate() as number;
  const pitch     = await getPitch() as number;
  const voiceName = await getVoiceName() as string;
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
    if (STORAGE_KEYS.includes(key))
      valueFromChromeStorage(key, resolve);
    else
      reject(new Error(`${key} is not a valid keystore`));
  });
}

function valueFromChromeStorage(
  key: string,
  resolve: {
    (value: string | number): void;
    (arg0: string | number): void;
  }
): void {
  chrome.storage.sync.get(key, item => {
    if (valueDoesNotExist(item[key]))
      resolveDefaultValue(key, resolve);
    else
      resolve(item[key]);
  });
}

function resolveDefaultValue(
  key: string,
  resolve: {
    (value: string | number): void;
    (arg0: string | number): void;
  }
): void {
  switch (key) {
    case PITCH:
      resolve(DEFAULT_PITCH);
      break;
    case VOICENAME:
      resolve(DEFAULT_VOICENAME);
      break;
    default:
      resolve(DEFAULT_RATE);
  }
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
): Promise<VoiceStorageOptions> {
  return storeValue({ voiceName });
}

async function storeRate(
  rate: number
): Promise<VoiceStorageOptions> {
  return storeValue({ rate });
}

async function storePitch(
  pitch: number
): Promise<VoiceStorageOptions> {
  return storeValue({ pitch });
}

async function storeValue(
  info: VoiceStorageOptions
): Promise<VoiceStorageOptions> {
  return new Promise((resolve, reject): void => {
    chrome.storage.sync.set(info, () => {
      if (chromeRuntimeError()) chromeErrorMessage(reject, info);
      else resolve(info);
    });
  });
}

function chromeErrorMessage(
  reject: { (reason?: string): void; (arg0: Error): void },
  info: VoiceStorageOptions
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
