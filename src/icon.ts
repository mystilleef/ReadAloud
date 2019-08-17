setDefaultIcon();

function updateBrowserIcon(speaking: boolean): void {
  if (speaking) setStopIcon();
  else setDefaultIcon();
}

function setDefaultIcon() {
  setIcon("default");
  setTooltip("Read aloud selected text");
}

function setStopIcon() {
  setIcon("stop");
  setTooltip("Stop reading");
}

function setIcon(name: string) {
  const details = { path: `images/${name}.svg` };
  chrome.browserAction.setIcon(details);
}

function setTooltip(tip: string) {
  chrome.browserAction.setTitle({ title: tip });
}

export { updateBrowserIcon as default };
