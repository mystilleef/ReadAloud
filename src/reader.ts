import badgeCounter from "./counter";
import {logChromeErrorMessage, logError} from "./error";
import {getStorageOptions} from "./storage";
import {onTtsEvent, stop} from "./ttshandler";

async function read(utterances: string): Promise<void> {
  await speak(utterances, await getSpeakOptions());
}

async function speak(
  phrase: string,
  options: chrome.ttsEngine.SpeakOptions
): Promise<void> {
  await new Promise<void>((_resolve, _reject) => {
    chrome.tts.speak(phrase, options, logChromeErrorMessage);
    badgeCounter.increment().catch(logError);
  });
}

async function getSpeakOptions(): Promise<chrome.tts.SpeakOptions> {
  const {rate, pitch, voiceName} = await getStorageOptions();
  return {
    pitch: pitch as number,
    rate: rate as number,
    voiceName: voiceName as string,
    volume: 1,
    enqueue: true,
    onEvent: onTtsEvent
  };
}

export {read, stop};
