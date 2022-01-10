const SELECTION_TIMEOUT = 500;
let TIMEOUT_ID = 0;

document.addEventListener("mouseup", _e => {
  window.clearTimeout(TIMEOUT_ID);
  TIMEOUT_ID = window.setTimeout(sendSelectedTextMessage, SELECTION_TIMEOUT);
});

chrome.runtime.onMessage.addListener(handleSelectionMessage);

function handleSelectionMessage(
  request: { query: string },
  _sender: chrome.runtime.MessageSender,
  _senderResponse: (response: { result: string }) => void
): boolean {
  if (request.query === "GET_SELECTION") sendSelectedTextMessage();
  return true;
}

function sendSelectedTextMessage(): void {
  chrome.runtime.sendMessage(chrome.runtime.id, {
    message: "READ_SELECTION",
    selection: selectedText().trim()
  });
}

function selectedText(): string {
  if (selectionExistsIn(window)) return selectionFrom(window);
  if (selectionExistsIn(document)) return selectionFrom(document);
  return "";
}

function selectionExistsIn(root: Window | Document): boolean {
  return root ? Boolean(root.getSelection()) : false;
}

function selectionFrom(root: Window | Document): string {
  const selection = root.getSelection();
  return selection ? selection.toString() : "";
}
