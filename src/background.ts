import { chromeaction } from "./constants";
import {
  addListenersToContextMenus,
  createContextMenu,
  resolveStorageConfigurations
} from "./context";

import { logChromeErrorMessage, logError } from "./error";
import { readStream, sendSelectedText } from "./message";
import { read, stop } from "./reader";
import { isSpeaking } from "./utils";

const COMMAND = "read-aloud-selected-text";

chrome.runtime.onInstalled.addListener(createContextMenu);

chrome.contextMenus.onClicked.addListener((info, _tab) => {
  addListenersToContextMenus(info).catch(logChromeErrorMessage);
});

chrome.storage.onChanged.addListener(
  (_changes: chrome.storage.StorageChange, _areaName: string) => {
    resolveStorageConfigurations();
  }
);

chrome.commands.onCommand.addListener(handleChromeCommand);

function handleChromeCommand(command: string): void {
  if (command === COMMAND) queryContentForSelection();
}

chromeaction.onClicked.addListener(handleBrowserAction);

function handleBrowserAction(_tab: chrome.tabs.Tab): void {
  const stopOrQuery = (speaking: boolean): void => {
    speaking ? stop() : queryContentForSelection();
  };
  isSpeaking().then(stopOrQuery).catch(logError);
}

function queryContentForSelection(): void {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs: chrome.tabs.Tab[]): void => {
      const tabid = tabs[0].id || -1;
      if (tabid < 0) return;
      const options = { tabId: tabid };
      sendSelectedText("", options).catch(logChromeErrorMessage);
    }
  );
}

readStream.subscribe(([selectedText, sender]) => {
  if (sender.id !== chrome.runtime.id) return;
  read(selectedText).catch(logError);
});

