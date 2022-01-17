import { getMessage } from "@extend-chrome/messages";

export const [sendRead, readStream] =
  getMessage<string>("READ");

export const [sendStartedSpeaking, startedSpeakingStream] =
  getMessage<string>("STARTED_SPEAKING");

export const [sendStoppedSpeaking, stoppedSpeakingStream] =
  getMessage<string>("STOPPED_SPEAKING");

export const [sendRefreshTts, refreshTtsStream] =
  getMessage<string>("REFRESH_TTS");

export const [sendSelectedText, selectedTextStream] =
  getMessage<string>("SELECTED_TEXT");
