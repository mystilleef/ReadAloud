import type { EmptyData } from "./utils";
import { getMessage } from "@extend-chrome/messages";

export const [sendRead, readStream] =
  getMessage<string>("READ");

export const [sendStartedSpeaking, startedSpeakingStream] =
  getMessage<EmptyData>("STARTED_SPEAKING");

export const [sendGotStartedSpeaking, gotStartedSpeakingStream] =
  getMessage<EmptyData>("GOT_STARTED_SPEAKING");

export const [sendEndSpeaking, endSpeakingStream] =
  getMessage<EmptyData>("STOPPED_SPEAKING");

export const [sendGotEndSpeaking, gotEndSpeakingStream] =
  getMessage<EmptyData>("GOT_END_SPEAKING");

export const [sendFinishedSpeaking, finishedSpeakingStream] =
  getMessage<EmptyData>("FINISHED_SPEAKING");

export const [sendGotFinishedSpeaking, gotFinishedSpeakingStream] =
  getMessage<EmptyData>("GOT_FINISHED_SPEAKING");

export const [sendRefreshTts, refreshTtsStream] =
  getMessage<EmptyData>("REFRESH_TTS");

export const [sendSelectedText, selectedTextStream] =
  getMessage<EmptyData>("SELECTED_TEXT");

