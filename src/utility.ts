function queryReadSelectionMessage(): void {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    sendSelectionQueryMessage
  );
}

function sendSelectionQueryMessage(tabs: Array<chrome.tabs.Tab>): boolean {
  const tabid = getTabId(tabs);
  if (tabid) chrome.tabs.sendMessage(tabid, { query: "GET_SELECTION" });
  return true;
}

function getTabId(tabs: Array<chrome.tabs.Tab>): number {
  return tabs[0].id || -1;
}

export { queryReadSelectionMessage as default };
