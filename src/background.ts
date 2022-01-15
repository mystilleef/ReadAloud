import { EXTENSION_ID } from "./constants";
import { isSpeaking } from "./utils";
import { logError } from "./error";
import { read, stop } from "./reader";
import { readStream, sendSelectedText } from "./message";
import {
  addListenersToContextMenus,
  createContextMenu,
  resolveStorageConfigurations
} from "./context";

const COMMAND = "read-aloud-selected-text";

readStream.subscribe(([selectedText, sender]) => {
  if (sender.id !== EXTENSION_ID) return;
  read(selectedText).catch(logError);
});

chrome.contextMenus.onClicked.addListener((info, _tab) => {
  addListenersToContextMenus(info).catch(logError);
});

chrome.storage.onChanged.addListener(
  (_changes: chrome.storage.StorageChange, _areaName: string) => {
    resolveStorageConfigurations();
  }
);

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
  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs: chrome.tabs.Tab[]): void => {
      const tabid = tabs[0].id || -1;
      if (tabid < 0) return;
      const options = { tabId: tabid };
      sendSelectedText("", options).catch(logError);
    }
  );
}

chrome.runtime.onInstalled.addListener(createContextMenu);
