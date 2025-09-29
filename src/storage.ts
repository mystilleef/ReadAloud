import { storage } from "@extend-chrome/storage";
import { PITCH, RATE, VOICENAME } from "./constants";

const DEFAULT_RATE = 1;
const DEFAULT_VOICENAME = "Google US English";
const DEFAULT_PITCH = 1;

async function getStorageOptions() {
  const rate = await getRate();
  const voiceName = await getVoiceName();
  const pitch = await getPitch();
  return { rate, voiceName, pitch };
}

async function getVoiceName(): Promise<string> {
  const voice = await storage.sync.get(VOICENAME);
  if (voice?.[VOICENAME]) return voice[VOICENAME] as string;
  return DEFAULT_VOICENAME;
}

async function getRate(): Promise<number> {
  const rate = await storage.sync.get(RATE);
  if (rate && rate[RATE] > 0) return Number(rate[RATE]);
  return DEFAULT_RATE;
}

async function getPitch(): Promise<number> {
  const pitch = await storage.sync.get(PITCH);
  if (pitch && pitch[PITCH] > 0) return Number(pitch[PITCH]);
  return DEFAULT_PITCH;
}

async function storeDefaultOptions(): Promise<void> {
  await storage.sync.clear();
  await storage.sync.set({
    rate: DEFAULT_RATE,
    voiceName: DEFAULT_VOICENAME,
    pitch: DEFAULT_PITCH,
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

export async function getSpeakOptions(): Promise<chrome.tts.TtsOptions> {
  const { rate, voiceName } = await getStorageOptions();
  const pitch = await getPitch();
  return {
    enqueue: true,
    rate,
    pitch,
    voiceName,
    volume: 1,
  };
}

export {
  getVoiceName,
  getRate,
  getPitch,
  getStorageOptions,
  storeVoice,
  storeRate,
  storePitch,
  storeDefaultOptions,
};
