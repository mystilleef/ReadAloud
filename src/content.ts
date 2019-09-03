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
  if (selectionExistsIn(window)) return getSelectionFrom(window);
  if (selectionExistsIn(document)) return getSelectionFrom(document);
  return "";
}

function selectionExistsIn(root: Window | Document): boolean {
  if (!root) return false;
  return !!root.getSelection();
}

function getSelectionFrom(root: Window | Document): string {
  const selection = root.getSelection();
  if (selection) return selection.toString();
  return "";
}
