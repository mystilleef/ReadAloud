import {
  onTtsEvent,
  readTts,
  refreshTts as refresh,
  stopTts as stop
} from "./ttshandler";
import { getSpeakOptions } from "./storage";

async function read(utterances: string): Promise<void> {
  await readTts(utterances, await getSpeakOptions(onTtsEvent));
}

export { read, stop, refresh };
