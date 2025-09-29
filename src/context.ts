import { EXTENSION_ID } from "./constants";
import {
  chromeRuntimeError,
  doNothing,
  logChromeErrorMessage,
  logError,
} from "./error";
import {
  getPitch,
  getRate,
  getStorageOptions,
  getVoiceName,
  storeDefaultOptions,
  storePitch,
  storeRate,
  storeVoice,
} from "./storage";
import { getTtsVoices } from "./utils";

const SUBMENU_ID_DELIMETER = "|";

const keyFromId = (id: string): string => `${id}${SUBMENU_ID_DELIMETER}`;

const UNIQUE_STAMP = `${EXTENSION_ID}`;
const SPEED_MENU_ID = `ReadAloudSpeedMenu-${UNIQUE_STAMP}`;
const SPEED_SUBMENU_ID_KEY = keyFromId(SPEED_MENU_ID);
const VOICES_MENU_ID = `ReadAloudVoicesMenu-${UNIQUE_STAMP}`;
const VOICES_SUBMENU_ID_KEY = keyFromId(VOICES_MENU_ID);
const PITCH_MENU_ID = `ReadAloudPitchMenu-${UNIQUE_STAMP}`;
const PITCH_SUBMENU_ID_KEY = keyFromId(PITCH_MENU_ID);
const READ_ALOUD_ROOT_MENU_ID = `ReadAloudMenu-${UNIQUE_STAMP}`;
const RESET_DEFAULT_MENU_ID = `ReadAloudResetDefaultMenu-${UNIQUE_STAMP}`;

const CONTEXTS = ["all"] as ["all"];
const TOP_LEVEL_MENU_INFO = [
  {
    contexts: CONTEXTS,
    id: SPEED_MENU_ID,
    parentId: READ_ALOUD_ROOT_MENU_ID,
    title: "Speed",
  },
  {
    contexts: CONTEXTS,
    id: VOICES_MENU_ID,
    parentId: READ_ALOUD_ROOT_MENU_ID,
    title: "Voices",
  },
  {
    contexts: CONTEXTS,
    id: PITCH_MENU_ID,
    parentId: READ_ALOUD_ROOT_MENU_ID,
    title: "Pitch",
  },
  {
    contexts: CONTEXTS,
    id: RESET_DEFAULT_MENU_ID,
    parentId: READ_ALOUD_ROOT_MENU_ID,
    title: "Reset to Default",
  },
];

// eslint-disable-next-line no-magic-numbers
const SPEED_OPTIONS = [1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2];
// eslint-disable-next-line no-magic-numbers
const PITCH_OPTIONS = [0.8, 0.9, 1, 1.1, 1.2];

chrome.storage.onChanged.addListener(
  (_changes: chrome.storage.StorageChange, _areaName: string) => {
    resolveStorageConfigurations();
  },
);

chrome.contextMenus.onClicked.addListener((info, _tab) => {
  addListenersToContextMenus(info).catch(logError);
});

export function createContextMenu() {
  chrome.contextMenus.create(
    {
      contexts: CONTEXTS,
      id: READ_ALOUD_ROOT_MENU_ID,
      title: "Read Aloud",
    },
    () => {
      if (chromeRuntimeError()) logChromeErrorMessage();
      else for (const menu of TOP_LEVEL_MENU_INFO) createTopLevelMenus(menu);
    },
  );
}

function createTopLevelMenus(menu: {
  id: string;
  title: string;
  parentId: string;
  contexts: ["all"];
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
  contexts: ["all"];
}): void {
  switch (menu.id) {
    case SPEED_MENU_ID:
      createSpeedRadioMenuItems(menu).catch(logError);
      break;
    case VOICES_MENU_ID:
      createVoicesRadioMenuItems(menu).catch(logError);
      break;
    case PITCH_MENU_ID:
      createPitchRadioMenuItems(menu).catch(logError);
      break;
    default:
  }
}

async function createSpeedRadioMenuItems(menu: {
  id: string;
  title: string;
  parentId: string;
  contexts: ["all"];
}): Promise<void> {
  const rate = await getRate();
  for (const speed of SPEED_OPTIONS)
    chrome.contextMenus.create(
      {
        checked: rate === Number(speed),
        contexts: menu.contexts,
        id: `${SPEED_SUBMENU_ID_KEY}${speed}`,
        parentId: menu.id,
        title: `${speed}x`,
        type: "radio",
      },
      logChromeErrorMessage,
    );
}

async function createVoicesRadioMenuItems(menu: {
  id: string;
  title: string;
  parentId: string;
  contexts: ["all"];
}): Promise<void> {
  const voices = await getTtsVoices();
  const voiceName = await getVoiceName();
  for (const voice of voices)
    chrome.contextMenus.create(
      {
        checked: voiceName === voice.voiceName,
        contexts: menu.contexts,
        id: `${VOICES_SUBMENU_ID_KEY}${voice.voiceName || ""}`,
        parentId: menu.id,
        title: `${voice.voiceName || ""}`,
        type: "radio",
      },
      logChromeErrorMessage,
    );
}

async function createPitchRadioMenuItems(menu: {
  id: string;
  title: string;
  parentId: string;
  contexts: ["all"];
}): Promise<void> {
  const pitch = await getPitch();
  for (const pitchValue of PITCH_OPTIONS)
    chrome.contextMenus.create(
      {
        checked: pitch === Number(pitchValue),
        contexts: menu.contexts,
        id: `${PITCH_SUBMENU_ID_KEY}${pitchValue}`,
        parentId: menu.id,
        title: `${pitchValue}`,
        type: "radio",
      },
      logChromeErrorMessage,
    );
}

export async function addListenersToContextMenus(
  info: chrome.contextMenus.OnClickData,
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
    case PITCH_MENU_ID:
      storePitch(numberValueFrom(info.menuItemId)).catch(logError);
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

function updateSubMenus(result: {
  rate: number;
  voiceName: string;
  pitch: number;
}): void {
  const MENU_IDS = [
    `${VOICES_SUBMENU_ID_KEY}${result.voiceName}`,
    `${SPEED_SUBMENU_ID_KEY}${result.rate}`,
    `${PITCH_SUBMENU_ID_KEY}${result.pitch}`,
  ];
  for (const id of MENU_IDS)
    chrome.contextMenus.update(id, { checked: true }, logChromeErrorMessage);
}

async function resetToDefault(): Promise<void> {
  await storeDefaultOptions();
}
