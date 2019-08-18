function queryContentForSelection(): void {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs: Array<chrome.tabs.Tab>): boolean => {
      const tabid = tabs[0].id || -1;
      if (tabid) chrome.tabs.sendMessage(tabid, { query: "GET_SELECTION" });
      return true;
    }
  );
}

export { queryContentForSelection as default };
