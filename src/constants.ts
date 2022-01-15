export const EXTENSION_ID = chrome.runtime.id;
export const MANIFEST_VERSION = chrome.runtime.getManifest().version;
export const RATE = "rate";
export const PITCH = "pitch";
export const VOICENAME = "voiceName";
export const chromeaction = getChromeAction();

function getChromeAction() {
  if (MANIFEST_VERSION === "3") return chrome.action;
  return chrome.browserAction;
}

