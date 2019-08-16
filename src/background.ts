import queryReadSelectionMessage from "./utility";
import read from "./reader"

const COMMAND: string = "HWFT";

chrome.commands.onCommand.addListener(handleChromeCommand);

function handleChromeCommand(command: string): void { 
  if (command === COMMAND) queryReadSelectionMessage();
}

chrome.browserAction.onClicked.addListener(handleBrowserAction);

function handleBrowserAction(_tab: chrome.tabs.Tab): void {
  queryReadSelectionMessage();
}

chrome.runtime.onMessage.addListener(handleReadSelectionMessage);

function handleReadSelectionMessage(
  request: {message: string, selection: string}, 
  _sender: chrome.runtime.MessageSender, 
  _senderResponse: (response: {result: string}) => void
): boolean {
  if (request.message === "READ_SELECTION") read(request.selection);
  return true;
}
