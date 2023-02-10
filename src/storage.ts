import { RATE, VOICENAME } from "./constants";
import { storage } from "@extend-chrome/storage";

const DEFAULT_RATE = 1;
const DEFAULT_VOICENAME = "Google US English";
// Const DEFAULT_VOICENAME = "";

async function getStorageOptions() {
  const rate = await getRate();
  const voiceName = await getVoiceName();
  return { rate, voiceName };
}

async function getVoiceName(): Promise<string> {
  const voice = await storage.sync.get(VOICENAME);
  if (voice && voice[VOICENAME]) return voice[VOICENAME] as string;
  return DEFAULT_VOICENAME;
}

async function getPitch(): Promise<number> {
  return new Promise<number>(resolve => {
    resolve(DEFAULT_PITCH);
  });
}

async function getRate(): Promise<number> {
  const rate = await storage.sync.get(RATE);
  if (rate && rate[RATE] > 0) return Number(rate[RATE]);
  return DEFAULT_RATE;
}

async function storeDefaultOptions(): Promise<void> {
  await storage.sync.clear();
  await storage.sync.set({
    pitch: DEFAULT_PITCH,
    rate: DEFAULT_RATE,
    voiceName: DEFAULT_VOICENAME
  });
}

async function storeVoice(voiceName: string) {
  await storage.sync.set({ voiceName });
}

async function storeRate(rate: number) {
  await storage.sync.set({ rate });
}

async function storePitch(pitch: number) {
  await storage.sync.set({ pitch });
}

export async function getSpeakOptions(
  ttsEvent: (_e: chrome.tts.TtsEvent) => void
): Promise<chrome.tts.SpeakOptions> {
  const { rate, pitch, voiceName } = await getStorageOptions();
  return {
    enqueue: true,
    onEvent: ttsEvent,
    pitch,
    rate,
    voiceName,
    volume: 1
  };
}

export {
  getVoiceName,
  getRate,
  getPitch,
  getStorageOptions,
  storeVoice,
  storePitch,
  storeRate,
  storeDefaultOptions
};
