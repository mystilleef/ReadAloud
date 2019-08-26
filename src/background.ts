import { logError } from "./error";
import { read, stop } from "./reader";

const COMMAND = "read-aloud-selected-text";

chrome.commands.onCommand.addListener(handleChromeCommand);

function handleChromeCommand(command: string): void {
  if (command === COMMAND) queryContentForSelection();
}

chrome.browserAction.onClicked.addListener(handleBrowserAction);

function handleBrowserAction(_tab: chrome.tabs.Tab): void {
  chrome.tts.isSpeaking((speaking: boolean) => {
    if (speaking) stop();
    else queryContentForSelection();
  });
}

function queryContentForSelection(): void {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs: chrome.tabs.Tab[]): boolean => {
      const tabid = tabs[0].id || -1;
      if (tabid) chrome.tabs.sendMessage(tabid, { query: "GET_SELECTION" });
      return true;
    }
  );
}

chrome.runtime.onMessage.addListener(handleReadSelectionMessage);

// tslint:disable-next-line:no-invariant-return
function handleReadSelectionMessage(
  request: { message: string; selection: string; speaking: boolean },
  sender: chrome.runtime.MessageSender,
  _senderResponse: (response: { result: string }) => void
): boolean {
  if (sender.id !== chrome.runtime.id) return true;
  if (request.message === "READ_SELECTION")
    read(request.selection).catch(e => logError(e.message));
  return true;
}
