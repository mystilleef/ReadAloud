const DOUBLE_CLICK_TIMEOUT = 1000;

document.addEventListener(
  "dblclick",
  _e => window.setTimeout(
    sendSelectedTextMessage,
    DOUBLE_CLICK_TIMEOUT
  )
);

chrome.runtime.onMessage.addListener(handleReadSelectionMessage);

function handleReadSelectionMessage(
  request: { query: string },
  _sender: chrome.runtime.MessageSender,
  _senderResponse: (response: { result: string }) => void
): boolean {
  if (request.query === "GET_SELECTION") sendSelectedTextMessage();
  return true;
}

function sendSelectedTextMessage(): void {
  chrome.runtime.sendMessage(
    chrome.runtime.id,
    { message: "READ_SELECTION", selection: getSelectedText().trim() }
  );
}

function getSelectedText(): string {
  if (windowSelectionExists()) return getWindowSelection();
  if (documentSelectionExists()) return getDocumentSelection();
  return "";
}

function windowSelectionExists(): boolean {
  if (!window) return false;
  return !!window.getSelection();
}

function getWindowSelection(): string {
  const selection = window.getSelection();
  if (selection) return selection.toString();
  return "";
}

function documentSelectionExists(): boolean {
  if (!document) return false;
  return !!document.getSelection();
}

function getDocumentSelection(): string {
  const selection = document.getSelection();
  if (selection) return selection.toString();
  return "";
}
