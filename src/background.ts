import { READ_ALOUD_COMMAND_STRING, EXTENSION_ID } from "./constants";
import { isSpeaking, messageToContentScript } from "./utils";
import { logError } from "./error";
import { read, stop, refresh } from "./reader";
import { readStream, refreshTtsStream, sendSelectedText } from "./message";
import { createContextMenu } from "./context";
import { storeDefaultOptions } from "./storage";

const COMMAND = READ_ALOUD_COMMAND_STRING;

readStream.subscribe(([selectedText, sender]) => {
  if (sender.id !== EXTENSION_ID) return;
  read(selectedText).catch(logError);
});

refreshTtsStream.subscribe(([_data, sender]) => {
  if (sender.id !== EXTENSION_ID) return;
  refresh();
});

chrome.commands.onCommand.addListener(onChromeCommand);

function onChromeCommand(command: string): void {
  if (command === COMMAND) queryContentForSelection();
}

chrome.action.onClicked.addListener(onAction);

function onAction(_tab: chrome.tabs.Tab): void {
  const stopOrQuery = (speaking: boolean): void => {
    speaking ? stop() : queryContentForSelection();
  };
  isSpeaking().then(stopOrQuery).catch(logError);
}

function queryContentForSelection(): void {
  messageToContentScript(sendSelectedText, "").catch(logError);
}

chrome.runtime.onInstalled.addListener(({reason}) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL)
    storeDefaultOptions().catch(logError);
});

chrome.runtime.onInstalled.addListener(createContextMenu);

