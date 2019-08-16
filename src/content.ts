const DOUBLE_CLICK_TIMEOUT = 250;
let selectionTimeoutId: number = 0;

document.addEventListener("dblclick", _event => readSelectionAfterTimeout());

function readSelectionAfterTimeout(): void {
  clearTimeout(selectionTimeoutId)
  selectionTimeoutId = window.setTimeout(
    sendReadSelectionMessage, 
    DOUBLE_CLICK_TIMEOUT
  );
}

chrome.runtime.onMessage.addListener(handleReadSelectionMessage);

function handleReadSelectionMessage(
  request: {query: string}, 
  _sender: chrome.runtime.MessageSender, 
  _senderResponse: (response: {result: string}) => void
): boolean {
  if (request.query === "GET_SELECTION") sendReadSelectionMessage(); 
  return true;
}

function sendReadSelectionMessage(): void {
  chrome.runtime.sendMessage({
    message: "READ_SELECTION", 
    selection: getSelectedText().trim()    
  });
}

function getSelectedText(): string {
  if (windowSelectionExists()) return getWindowSelection();
  if (documentSelectionExists()) return getDocumentSelection();
  return "";
}

function windowSelectionExists(): boolean {
  if (!window || !window.getSelection) return false;
  if (window.getSelection()) return true;
  return false;
}

function getWindowSelection(): string {
  const selection = window.getSelection()
  if (selection) return selection.toString()
  return "";
}

function documentSelectionExists(): boolean {
  if (!document || !document.getSelection) return false;
  if (document.getSelection()) return true;
  return false;
}

function getDocumentSelection(): string {
  const selection = document.getSelection()
  if (selection) return selection.toString()
  return "";
}
