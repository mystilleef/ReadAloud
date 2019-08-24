/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEFAULT_VOICENAME, EXTENSION_ID, PITCH, RATE } from "./constants";
import { chromeRuntimeError, logChromeErrorMessage }    from "./error";
import {
  getStorageOptions,
  storePitch,
  storeRate,
  storeVoice
}                                                       from "./storage";

const SUBMENU_ID_DELIMETER = "|";

const keyFromId = (id: string): string => `${id}${SUBMENU_ID_DELIMETER}`;

const UNIQUE_STAMP            = `${EXTENSION_ID}`;
const SPEED_MENU_ID           = `ReadAloudSpeedMenu-${UNIQUE_STAMP}`;
const SPEED_SUBMENU_ID_KEY    = keyFromId(SPEED_MENU_ID);
const PITCH_MENU_ID           = `ReadAloudPitchMenu-${UNIQUE_STAMP}`;
const PITCH_SUBMENU_ID_KEY    = keyFromId(PITCH_MENU_ID);
const VOICES_MENU_ID          = `ReadAloudVoicesMenu-${UNIQUE_STAMP}`;
const VOICES_SUBMENU_ID_KEY   = keyFromId(VOICES_MENU_ID);
const READ_ALOUD_ROOT_MENU_ID = `ReadAloudMenu-${UNIQUE_STAMP}`;
const RESET_DEFAULT_MENU_ID   = `ReadAloudResetDefaultMenu-${UNIQUE_STAMP}`;

const CONTEXTS            = ["all"];
const TOP_LEVEL_MENU_INFO = [
  {
    title   : "Speed",
    parentId: READ_ALOUD_ROOT_MENU_ID,
    id      : SPEED_MENU_ID,
    contexts: CONTEXTS
  },
  {
    title   : "Voices",
    parentId: READ_ALOUD_ROOT_MENU_ID,
    id      : VOICES_MENU_ID,
    contexts: CONTEXTS
  },
  {
    title   : "Pitch",
    parentId: READ_ALOUD_ROOT_MENU_ID,
    id      : PITCH_MENU_ID,
    contexts: CONTEXTS
  },
  {
    title   : "Reset to Default",
    parentId: READ_ALOUD_ROOT_MENU_ID,
    id      : RESET_DEFAULT_MENU_ID,
    contexts: CONTEXTS
  }
];

const SPEED_OPTIONS = [1, 1.2, 1.4, 1.6, 1.8, 2];
const PITCH_OPTIONS = [0, 0.5, 1, 1.5, 2];

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create(
    {
      title   : "Read Aloud",
      id      : READ_ALOUD_ROOT_MENU_ID,
      contexts: CONTEXTS
    },
    () => {
      if (chromeRuntimeError()) logChromeErrorMessage();
      else TOP_LEVEL_MENU_INFO.forEach(menu => createTopLevelMenus(menu));
    }
  );
});

function createTopLevelMenus(
  menu: { id: string; title: string; parentId: string; contexts: string[] }
): void {
  chrome.contextMenus.create(
    menu,
    () => {
      if (chromeRuntimeError()) logChromeErrorMessage();
      else createRadioMenuItems(menu);
    }
  );
}

function createRadioMenuItems(
  menu: { id: string; title: string; parentId: string; contexts: string[] }
): void {
  switch (menu.id) {
    case SPEED_MENU_ID:
      createSpeedRadioMenuItems(menu);
      break;
    case VOICES_MENU_ID:
      createVoicesRadioMenuItems(menu);
      break;
    case PITCH_MENU_ID:
      createPitchRadioMenuItems(menu);
      break;
    default:
      break;
  }
}

function createSpeedRadioMenuItems(
  menu: { id: string; title: string; parentId: string; contexts: string[] }
): void {
  chrome.storage.sync.get(RATE, items => {
    SPEED_OPTIONS.forEach(speed => chrome.contextMenus.create(
      {
        parentId: menu.id,
        contexts: menu.contexts,
        type    : "radio",
        title   : `${speed}x`,
        id      : `${SPEED_SUBMENU_ID_KEY}${speed}`,
        checked : items.rate === Number(speed)
      },
      () => logChromeErrorMessage()
    ));
  });
}

function createVoicesRadioMenuItems(
  menu: { id: string; title: string; parentId: string; contexts: string[] }
): void {
  chrome.tts.getVoices((voices: chrome.tts.TtsVoice[]) => {
    chrome.storage.sync.get("voiceName", items => {
      voices.forEach(voice => chrome.contextMenus.create(
        {
          parentId: menu.id,
          contexts: menu.contexts,
          type    : "radio",
          title   : `${voice.voiceName}`,
          id      : `${VOICES_SUBMENU_ID_KEY}${voice.voiceName}`,
          checked : items.voiceName === voice.voiceName
        },
        () => logChromeErrorMessage()
      ));
    });
  });
}

function createPitchRadioMenuItems(
  menu: { id: string; title: string; parentId: string; contexts: string[] }
): void {
  chrome.storage.sync.get(PITCH, items => {
    PITCH_OPTIONS.forEach(pitch => chrome.contextMenus.create(
      {
        parentId: menu.id,
        type    : "radio",
        contexts: menu.contexts,
        title   : `${pitch}`,
        id      : `${PITCH_SUBMENU_ID_KEY}${pitch}`,
        checked : items.pitch === Number(pitch)
      },
      () => logChromeErrorMessage()
    ));
  });
}

chrome.contextMenus.onClicked.addListener((info, _tab) => {
  if (info.menuItemId === RESET_DEFAULT_MENU_ID) resetToDefault();
  else onRadioMenuItemClick(info);
});

// noinspection FunctionTooLongJS
function onRadioMenuItemClick(info: chrome.contextMenus.OnClickData): void {
  switch (info.parentMenuItemId) {
    case VOICES_MENU_ID:
      storeVoice(stringValueFrom(info.menuItemId))
        .catch(error => console.error(error.message));
      break;
    case SPEED_MENU_ID:
      storeRate(numberValueFrom(info.menuItemId))
        .catch(error => console.error(error.message));
      break;
    case PITCH_MENU_ID:
      storePitch(numberValueFrom(info.menuItemId))
        .catch(error => console.error(error.message));
      break;
    default:
      console.error("ERROR: Invalid menu item parameter");
  }
}

function stringValueFrom(id: string): string {
  return id.split(SUBMENU_ID_DELIMETER).pop() || DEFAULT_VOICENAME;
}

function numberValueFrom(id: string): number {
  return Number(id.split(SUBMENU_ID_DELIMETER).pop());
}

chrome.storage.onChanged.addListener((
  _changes: chrome.storage.StorageChange,
  _areaName: string
) => resolveStorageConfigurations());

function resolveStorageConfigurations(): void {
  getStorageOptions()
    .then(result => updateSubMenus(result))
    .catch(_e => "");
}

function updateSubMenus(
  result: {
    rate: number | string;
    pitch: number | string;
    voiceName: string | number;
  }
): void {
  const MENU_IDS = [
    `${PITCH_SUBMENU_ID_KEY}${result.pitch}`,
    `${VOICES_SUBMENU_ID_KEY}${result.voiceName}`,
    `${SPEED_SUBMENU_ID_KEY}${result.rate}`
  ];
  MENU_IDS.forEach(id => chrome.contextMenus.update(
    id,
    { checked: true },
    () => logChromeErrorMessage()
  ));
}

function resetToDefault(): void {
  chrome.storage.sync.clear(() => logChromeErrorMessage());
}
