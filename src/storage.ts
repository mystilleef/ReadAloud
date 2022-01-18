import { storage } from "@extend-chrome/storage";
import { PITCH, RATE, VOICENAME } from "./constants";

const DEFAULT_RATE = 1.2;
const DEFAULT_PITCH = 0;
const DEFAULT_VOICENAME = "Google UK English Female";

async function getStorageOptions() {
  const rate = await getRate();
  const pitch = await getPitch();
  const voiceName = await getVoiceName();
  return { rate, pitch, voiceName };
}

async function getVoiceName(): Promise<string> {
  const voice = await storage.sync.get(VOICENAME);
  if (voice && voice[VOICENAME]) return voice[VOICENAME] as string;
  return DEFAULT_VOICENAME;
}

async function getPitch(): Promise<number> {
  const pitch = await storage.sync.get(PITCH);
  if (pitch && pitch[PITCH] >= 0) return Number(pitch[PITCH]);
  return DEFAULT_PITCH;
}

async function getRate(): Promise<number> {
  const rate = await storage.sync.get(RATE);
  if (rate && rate[RATE] > 0) return Number(rate[RATE]);
  return DEFAULT_RATE;
}

async function storeDefaultOptions(): Promise<void> {
  await storage.sync.clear();
  await storage.sync.set({
    rate: DEFAULT_RATE,
    pitch: DEFAULT_PITCH,
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
