const EXTENSION_ID      = chrome.runtime.id;
const RATE              = "rate";
const PITCH             = "pitch";
const VOICENAME         = "voiceName";
const DEFAULT_RATE      = 1.2;
const DEFAULT_PITCH     = 0;
const DEFAULT_VOLUME    = 1;
const DEFAULT_VOICENAME = "Google UK English Female";

const DEFAULT_OPTIONS = {
  pitch    : DEFAULT_PITCH,
  volume   : DEFAULT_VOLUME,
  rate     : DEFAULT_RATE,
  voiceName: DEFAULT_VOICENAME,
  enqueue  : true
};

interface VoiceStorageOptions {
  rate?: number;
  pitch?: number;
  voiceName?: string;
}

export {
  RATE,
  PITCH,
  VOICENAME,
  DEFAULT_OPTIONS,
  DEFAULT_VOICENAME,
  DEFAULT_RATE,
  DEFAULT_PITCH,
  EXTENSION_ID,
  VoiceStorageOptions
};
