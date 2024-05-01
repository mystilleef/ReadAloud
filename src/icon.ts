export default async function updateBrowserIcon(
  counter: number,
): Promise<void> {
  if (counter) await setStopIcon();
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
  await chrome.action.setIcon({ path: `images/${name}.png` });
}

async function setTooltip(tip: string): Promise<void> {
  await chrome.action.setTitle({ title: tip });
}
