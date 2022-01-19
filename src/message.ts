import type { EmptyData } from "./utils";
import { getMessage } from "@extend-chrome/messages";

export const [sendRead, readStream] =
  getMessage<string>("READ");

export const [sendStartedSpeaking, startedSpeakingStream] =
  getMessage<EmptyData>("STARTED_SPEAKING");

export const [sendStoppedSpeaking, stoppedSpeakingStream] =
  getMessage<EmptyData>("STOPPED_SPEAKING");

export const [sendRefreshTts, refreshTtsStream] =
  getMessage<EmptyData>("REFRESH_TTS");

export const [sendSelectedText, selectedTextStream] =
  getMessage<EmptyData>("SELECTED_TEXT");

