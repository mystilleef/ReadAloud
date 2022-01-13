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
  return voice[VOICENAME] as string;
}

async function getPitch(): Promise<number> {
  const pitch = await storage.sync.get(PITCH);
  return Number(pitch[PITCH]);
}

async function getRate(): Promise<number> {
  const rate = await storage.sync.get(RATE);
  return Number(rate[RATE]);
}

async function storeDefaultOptions(): Promise<void> {
  await storage.sync.clear();
  await store(DEFAULT_VOICENAME, DEFAULT_RATE, DEFAULT_PITCH);
}

async function store(voiceName: string, rate: number, pitch: number) {
  await storage.sync.set({ rate, pitch, voiceName });
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
  store,
  storeDefaultOptions
};
