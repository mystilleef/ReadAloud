import {
  chromeRuntimeError,
  doNothing,
  logChromeErrorMessage,
  logError
} from "./error";
import {
  getRate,
  getStorageOptions,
  getVoiceName,
  storeDefaultOptions,
  storeRate,
  storeVoice
} from "./storage";
import { EXTENSION_ID } from "./constants";
import { getTtsVoices } from "./utils";

const SUBMENU_ID_DELIMETER = "|";

const keyFromId = (id: string): string => `${id}${SUBMENU_ID_DELIMETER}`;

const UNIQUE_STAMP = `${EXTENSION_ID}`;
const SPEED_MENU_ID = `ReadAloudSpeedMenu-${UNIQUE_STAMP}`;
const SPEED_SUBMENU_ID_KEY = keyFromId(SPEED_MENU_ID);
const VOICES_MENU_ID = `ReadAloudVoicesMenu-${UNIQUE_STAMP}`;
const VOICES_SUBMENU_ID_KEY = keyFromId(VOICES_MENU_ID);
const READ_ALOUD_ROOT_MENU_ID = `ReadAloudMenu-${UNIQUE_STAMP}`;
const RESET_DEFAULT_MENU_ID = `ReadAloudResetDefaultMenu-${UNIQUE_STAMP}`;


const CONTEXTS = ["all"] as chrome.contextMenus.ContextType[];
const TOP_LEVEL_MENU_INFO = [
  {
    contexts: CONTEXTS,
    id: SPEED_MENU_ID,
    parentId: READ_ALOUD_ROOT_MENU_ID,
    title: "Speed"
  },
  {
    contexts: CONTEXTS,
    id: VOICES_MENU_ID,
    parentId: READ_ALOUD_ROOT_MENU_ID,
    title: "Voices"
  },
  {
    contexts: CONTEXTS,
    id: RESET_DEFAULT_MENU_ID,
    parentId: READ_ALOUD_ROOT_MENU_ID,
    title: "Reset to Default"
  }
];

// eslint-disable-next-line no-magic-numbers
const SPEED_OPTIONS = [1, 1.2, 1.4, 1.5, 1.6, 1.8, 2];
// eslint-disable-next-line no-magic-numbers
// Const PITCH_OPTIONS = [0, 0.5, 1, 1.5, 2];

chrome.storage.onChanged.addListener(
  (_changes: chrome.storage.StorageChange, _areaName: string) => {
    resolveStorageConfigurations();
  }
);

chrome.contextMenus.onClicked.addListener((info, _tab) => {
  addListenersToContextMenus(info).catch(logError);
});

export function createContextMenu() {
  chrome.contextMenus.create(
    {
      contexts: CONTEXTS,
      id: READ_ALOUD_ROOT_MENU_ID,
      title: "Read Aloud"
    },
    () => {
      if (chromeRuntimeError()) logChromeErrorMessage();
      else TOP_LEVEL_MENU_INFO.forEach(createTopLevelMenus);
    }
  );
}

function createTopLevelMenus(menu: {
  id: string;
  title: string;
  parentId: string;
  contexts: chrome.contextMenus.ContextType[];
}): void {
  chrome.contextMenus.create(menu, () => {
    if (chromeRuntimeError()) logChromeErrorMessage();
    else createRadioMenuItems(menu);
  });
}

function createRadioMenuItems(menu: {
  id: string;
  title: string;
  parentId: string;
  contexts: chrome.contextMenus.ContextType[];
}): void {
  switch (menu.id) {
    case SPEED_MENU_ID:
      createSpeedRadioMenuItems(menu).catch(logError);
      break;
    case VOICES_MENU_ID:
      createVoicesRadioMenuItems(menu).catch(logError);
      break;
    default:
  }
}

async function createSpeedRadioMenuItems(menu: {
  id: string;
  title: string;
  parentId: string;
  contexts: chrome.contextMenus.ContextType[];
}): Promise<void> {
  const rate = await getRate();
  SPEED_OPTIONS.forEach(speed => {
    chrome.contextMenus.create(
      {
        checked: rate === Number(speed),
        contexts: menu.contexts,
        id: `${SPEED_SUBMENU_ID_KEY}${speed}`,
        parentId: menu.id,
        title: `${speed}x`,
        type: "radio"
      },
      logChromeErrorMessage
    );
  });
}

async function createVoicesRadioMenuItems(menu: {
  id: string;
  title: string;
  parentId: string;
  contexts: chrome.contextMenus.ContextType[];
}): Promise<void> {
  const voices = await getTtsVoices();
  const voiceName = await getVoiceName();
  voices.forEach(voice => {
    chrome.contextMenus.create(
      {
        checked: voiceName === voice.voiceName,
        contexts: menu.contexts,
        id: `${VOICES_SUBMENU_ID_KEY}${voice.voiceName || ""}`,
        parentId: menu.id,
        title: `${voice.voiceName || ""}`,
        type: "radio"
      },
      logChromeErrorMessage
    );
  });
}

export async function addListenersToContextMenus(
  info: chrome.contextMenus.OnClickData
) {
  if (info.menuItemId === RESET_DEFAULT_MENU_ID) await resetToDefault();
  else onRadioMenuItemClick(info);
}

function onRadioMenuItemClick(info: chrome.contextMenus.OnClickData): void {
  switch (info.parentMenuItemId) {
    case VOICES_MENU_ID:
      storeVoice(stringValueFrom(info.menuItemId)).catch(logError);
      break;
    case SPEED_MENU_ID:
      storeRate(numberValueFrom(info.menuItemId)).catch(logError);
      break;
    default:
      logError("ERROR: Invalid menu item parameter");
  }
}

function stringValueFrom(id: string | number): string {
  if (typeof id === "number") return String(id);
  return id.split(SUBMENU_ID_DELIMETER).pop() as string;
}

function numberValueFrom(id: string | number): number {
  if (typeof id === "number") return id;
  return Number(id.split(SUBMENU_ID_DELIMETER).pop());
}

export function resolveStorageConfigurations(): void {
  getStorageOptions().then(updateSubMenus).catch(doNothing);
}

function updateSubMenus(
  result: { rate: number, pitch: number, voiceName: string }
): void {
  const MENU_IDS = [
    `${VOICES_SUBMENU_ID_KEY}${result.voiceName}`,
    `${SPEED_SUBMENU_ID_KEY}${result.rate}`
  ];
  MENU_IDS.forEach(id => {
    chrome.contextMenus.update(id, { checked: true }, logChromeErrorMessage);
  });
}

async function resetToDefault(): Promise<void> {
  await storeDefaultOptions();
}
