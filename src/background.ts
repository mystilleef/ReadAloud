import queryContentForSelection from "./utility";
import { read, stop } from "./reader";

const COMMAND = "HWFT";

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

chrome.runtime.onMessage.addListener(handleReadSelectionMessage);

function handleReadSelectionMessage(
  request: { message: string; selection: string; speaking: boolean },
  _sender: chrome.runtime.MessageSender,
  _senderResponse: (response: { result: string }) => void
): boolean {
  if (request.message === "READ_SELECTION") read(request.selection);
  return true;
}
