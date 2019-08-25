const EXTENSION_ID      = chrome.runtime.id;
const RATE              = "rate";
const PITCH             = "pitch";
const VOICENAME         = "voiceName";
const DEFAULT_RATE      = 1.2;
const DEFAULT_PITCH     = 0;
const DEFAULT_VOICENAME = "Google UK English Female";

interface VoiceStorageOptions {
  readonly [index: string]: number | string | undefined;

  readonly rate?: number;
  readonly pitch?: number;
  readonly voiceName?: string;
}

export {
  RATE,
  PITCH,
  VOICENAME,
  DEFAULT_VOICENAME,
  DEFAULT_RATE,
  DEFAULT_PITCH,
  EXTENSION_ID,
  VoiceStorageOptions
};
