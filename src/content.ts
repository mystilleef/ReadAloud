const DOUBLE_CLICK_TIMEOUT = 750;

document.addEventListener(
  "dblclick",
  _e => window.setTimeout(
    sendSelectedTextMessage,
    DOUBLE_CLICK_TIMEOUT
  )
);

chrome.runtime.onMessage.addListener(handleSelectionMessage);

function handleSelectionMessage(
  request: { query: string; },
  _sender: chrome.runtime.MessageSender,
  _senderResponse: (response: { result: string; }) => void
): boolean {
  if (request.query === "GET_SELECTION") sendSelectedTextMessage();
  return true;
}

function sendSelectedTextMessage(): void {
  chrome.runtime.sendMessage(
    chrome.runtime.id,
    { message: "READ_SELECTION", selection: selectedText().trim() }
  );
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
