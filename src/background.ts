import { logError } from "./error";
import { read, stop } from "./reader";
import { isSpeaking } from "./utils";

const COMMAND = "read-aloud-selected-text";

chrome.commands.onCommand.addListener(handleChromeCommand);

function handleChromeCommand(command: string): void {
  if (command === COMMAND) queryContentForSelection();
}

chrome.browserAction.onClicked.addListener(handleBrowserAction);

function handleBrowserAction(_tab: chrome.tabs.Tab): void {
  const stopOrQuery = (speaking: boolean): void =>
    speaking ? stop() : queryContentForSelection();
  isSpeaking().then(stopOrQuery).catch(logError);
}

function queryContentForSelection(): void {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs: chrome.tabs.Tab[]): void => {
      // eslint-disable-next-line no-magic-numbers
      const tabid = tabs[0].id || -1;
      if (tabid) chrome.tabs.sendMessage(tabid, { query: "GET_SELECTION" });
    }
  );
}

chrome.runtime.onMessage.addListener(handleReadSelectionMessage);

function handleReadSelectionMessage(
  request: { message: string; selection: string; speaking: boolean },
  sender: chrome.runtime.MessageSender,
  _senderResponse: (response: { result: string }) => void
): void {
  if (sender.id !== chrome.runtime.id) return;
  if (request.message === "READ_SELECTION" && request.selection !== "")
    read(request.selection).catch(logError);
}
