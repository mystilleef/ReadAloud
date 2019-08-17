setDefaultIcon();

function updateBrowserIcon(speaking: boolean): void {
  if (speaking) setStopIcon();
  else setDefaultIcon();
}

function setDefaultIcon(): void {
  setIcon("default");
  setTooltip("Read aloud selected text");
}

function setStopIcon(): void {
  setIcon("stop");
  setTooltip("Stop reading");
}

function setIcon(name: string): void {
  const details = { path: `images/${name}.svg` };
  chrome.browserAction.setIcon(details);
}

function setTooltip(tip: string): void {
  chrome.browserAction.setTitle({ title: tip });
}

export { updateBrowserIcon as default };
