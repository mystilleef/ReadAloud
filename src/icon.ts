async function updateBrowserIcon(speaking: boolean): Promise<void> {
  if (speaking) await setStopIcon();
  else await setDefaultIcon();
}

async function setDefaultIcon(): Promise<void> {
  setIcon("default");
  await setTooltip("Read aloud selected text");
}

async function setStopIcon(): Promise<void> {
  setIcon("stop");
  await setTooltip("Stop reading");
}

function setIcon(name: string): void {
  const details = { path: `images/${name}.png` };
  chrome.action.setIcon(details);
}

async function setTooltip(tip: string): Promise<void> {
  await chrome.action.setTitle({ title: tip });
}

export { updateBrowserIcon as default };
