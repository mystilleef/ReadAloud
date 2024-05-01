import { getSpeakOptions } from "./storage";
import { readTts, refreshTts as refresh, stopTts as stop } from "./ttshandler";

async function read(utterances: string): Promise<void> {
  await readTts(utterances, await getSpeakOptions());
}

export { read, stop, refresh };
