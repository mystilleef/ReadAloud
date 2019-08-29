import {
  DEFAULT_PITCH,
  DEFAULT_RATE,
  DEFAULT_VOICENAME,
  VoiceStorageOptions
} from "./constants";
import BadgeCounter from "./counter";
import { logChromeErrorMessage, logError } from "./error";
import updateBrowserIcon from "./icon";
import { getStorageOptions, storeDefaultOptions } from "./storage";
import { isSpeaking } from "./utils";

const BY_COMMON_PUNCTUATIONS = /[_.,:;!?<>/()—[\]{}]/gm;
const DEFAULT_VOLUME         = 1;
const DEFAULT_QUEUE          = true;
const badgeCounter           = new BadgeCounter();

const DEFAULT_OPTIONS = {
  pitch    : DEFAULT_PITCH,
  rate     : DEFAULT_RATE,
  voiceName: DEFAULT_VOICENAME,
  volume   : DEFAULT_VOLUME,
  enqueue  : DEFAULT_QUEUE
};

const OPTIONS: chrome.tts.SpeakOptions = {
  ...DEFAULT_OPTIONS,
  onEvent: onTtsEvent
};

function onTtsEvent(event: chrome.tts.TtsEvent): void {
  isSpeaking().then(updateBrowserIcon).catch(logError);
  handleTtsEvent(event);
}

function handleTtsEvent(event: chrome.tts.TtsEvent): void {
  if (event.type === "error") error(`Error: ${event.errorMessage}`);
  else if (event.type === "end") badgeCounter.decrement();
}

function error(message: string): void {
  stop();
  logError(message);
}

async function read(utterances: string): Promise<void> {
  await resolveStorageOptions();
  utterances
    .split(BY_COMMON_PUNCTUATIONS)
    .map(phrase => phrase.trim())
    .filter(phrase => phrase.length)
    .forEach(phrase => speak(phrase, OPTIONS));
}

async function resolveStorageOptions(): Promise<void> {
  try {
    updateOptions(await getStorageOptions());
  } catch (e) {
    await storeDefaultOptions();
  }
}

function updateOptions(result: VoiceStorageOptions): void {
  OPTIONS.rate      = result.rate as number;
  OPTIONS.pitch     = result.pitch as number;
  OPTIONS.voiceName = result.voiceName as string;
}

function speak(phrase: string, options: chrome.ttsEngine.SpeakOptions): void {
  chrome.tts.speak(phrase, options, (): void => {
    logChromeErrorMessage();
  });
  badgeCounter.increment();
}

function stop(): void {
  chrome.tts.stop();
  badgeCounter.reset();
}

export { read, stop };
