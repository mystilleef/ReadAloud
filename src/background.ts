import { read, stop }           from "./reader";
import queryContentForSelection from "./utility";

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
  sender: chrome.runtime.MessageSender,
  _senderResponse: (response: { result: string }) => void
): boolean {
  if (sender.id !== chrome.runtime.id) return true;
  if (request.message === "READ_SELECTION") read(request.selection);
  return true;
}
