import { EXTENSION_ID, READ_ALOUD_COMMAND_STRING } from "./constants";
import {
  gotEndSpeakingStream,
  gotFinishedSpeakingStream,
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

readStream.subscribe(([selectedText, sender]) => {
  if (sender.id !== EXTENSION_ID) return;
  badgeCounter.increment().catch(logError);
  read(selectedText).catch(logError);
});

gotEndSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id === EXTENSION_ID) badgeCounter.decrement().catch(logError);
});

gotFinishedSpeakingStream.subscribe(([_data, sender]) => {
  if (sender.id === EXTENSION_ID) badgeCounter.reset().catch(logError);
});

refreshTtsStream.subscribe(([_data, sender]) => {
  if (sender.id === EXTENSION_ID) refresh().catch(logError);
});

chrome.commands.onCommand.addListener(onChromeCommand);

function onChromeCommand(command: string): void {
  if (command === COMMAND) queryContentForSelection();
}

chrome.action.onClicked.addListener(onAction);

function onAction(_tab: chrome.tabs.Tab): void {
  const stopOrQuery = (speaking: boolean): void => {
    speaking ? stop().catch(logError) : queryContentForSelection();
  };
  isSpeaking().then(stopOrQuery).catch(logError);
}

function queryContentForSelection(): void {
  messageToContentScript(sendSelectedText, {}).catch(logError);
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL)
    storeDefaultOptions().catch(logError);
});

chrome.runtime.onInstalled.addListener(createContextMenu);

