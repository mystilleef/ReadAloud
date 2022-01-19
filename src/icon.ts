async function updateBrowserIcon(speaking: boolean): Promise<void> {
  if (speaking) await setStopIcon();
  else await setDefaultIcon();
}

async function setDefaultIcon(): Promise<void> {
  await setIcon("default");
  await setTooltip("Read aloud selected text");
}

async function setStopIcon(): Promise<void> {
  await setIcon("stop");
  await setTooltip("Stop reading");
}

async function setIcon(name: string): Promise<void> {
  return new Promise(_resolve => {
    chrome.action.setIcon({ path: `images/${name}.png` });
  });
}

async function setTooltip(tip: string): Promise<void> {
  await chrome.action.setTitle({ title: tip });
}

export { updateBrowserIcon as default };
