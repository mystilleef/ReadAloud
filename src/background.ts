import { EXTENSION_ID, READ_ALOUD_COMMAND_STRING } from "./constants";
import { debounceTime, throttleTime } from "rxjs";
import {
  gotEndSpeakingStream,
  readStream,
  refreshTtsStream,
  sendSelectedText
} from "./message";
import { isSpeaking, messageToContentScript } from "./utils";
import { read, refresh, stop } from "./reader";
import badgeCounter from "./counter";
import { createContextMenu } from "./context";
import { logError } from "./error";
import { storeDefaultOptions } from "./storage";

const COMMAND = READ_ALOUD_COMMAND_STRING;
const END_TIMEOUT = 500;
const READ_TIMEOUT = 750;
const REFRESH_TIMEOUT = 7000;

readStream
  .pipe(throttleTime(READ_TIMEOUT))
  .pipe(debounceTime(READ_TIMEOUT))
  .subscribe(([selectedText, sender]) => {
    if (sender.id !== EXTENSION_ID) return;
    read(selectedText).catch(logError);
    badgeCounter.increment().catch(logError);
  });

refreshTtsStream
  .pipe(throttleTime(REFRESH_TIMEOUT))
  .pipe(debounceTime(REFRESH_TIMEOUT))
  .subscribe(([_data, sender]) => {
    if (sender.id !== EXTENSION_ID) return;
    refresh().catch(logError);
    badgeCounter.update().catch(logError);
  });

gotEndSpeakingStream
  .pipe(throttleTime(END_TIMEOUT))
  .pipe(debounceTime(END_TIMEOUT))
  .subscribe(([_data, sender]) => {
    if (sender.id === EXTENSION_ID) badgeCounter.decrement().catch(logError);
  });

chrome.runtime.onInstalled.addListener(createContextMenu);

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL)
    storeDefaultOptions().catch(logError);
});

chrome.commands.onCommand.addListener((command: string): void => {
  if (command === COMMAND) selectTextFromContent();
});

chrome.action.onClicked.addListener((_tab: chrome.tabs.Tab): void => {
  const stopOrQuery = (speaking: boolean): void => {
    speaking ? stop().catch(logError) : selectTextFromContent();
  };
  isSpeaking().then(stopOrQuery).catch(logError);
  badgeCounter.reset().catch(logError);
});

function selectTextFromContent(): void {
  messageToContentScript(sendSelectedText, {}).catch(logError);
}
