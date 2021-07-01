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
  const details = {path: `images/${name}.svg`};
  return new Promise<void>(resolve => {
    resolve(chrome.browserAction.setIcon(details));
  });
}

async function setTooltip(tip: string): Promise<void> {
  return new Promise<void>(resolve => {
    resolve(chrome.browserAction.setTitle({title: tip}));
  });
}

export {updateBrowserIcon as default};
