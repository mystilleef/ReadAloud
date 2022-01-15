import { chromeaction } from "./constants";

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
  return new Promise<void>(resolve => {
    const details = { path: `images/${name}.svg` };
    resolve(chromeaction.setIcon(details));
  });
}

async function setTooltip(tip: string): Promise<void> {
  return new Promise<void>(resolve => {
    resolve(chromeaction.setTitle({ title: tip }));
  });
}

export { updateBrowserIcon as default };
