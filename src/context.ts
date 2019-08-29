import {
  DEFAULT_VOICENAME,
  EXTENSION_ID,
  VoiceStorageOptions
} from "./constants";
import {
  chromeRuntimeError,
  doNothing,
  logChromeErrorMessage,
  logError
} from "./error";
import {
  getPitch,
  getRate,
  getStorageOptions,
  getVoiceName,
  storePitch,
  storeRate,
  storeVoice
} from "./storage";
import { getTtsVoices } from "./utils";

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
      else TOP_LEVEL_MENU_INFO.forEach(createTopLevelMenus);
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

async function createSpeedRadioMenuItems(
  menu: { id: string; title: string; parentId: string; contexts: string[] }
): Promise<void> {
  const rate = await getRate();
  SPEED_OPTIONS.forEach(speed => chrome.contextMenus.create(
    {
      parentId: menu.id,
      contexts: menu.contexts,
      type    : "radio",
      title   : `${speed}x`,
      id      : `${SPEED_SUBMENU_ID_KEY}${speed}`,
      checked : rate === Number(speed)
    },
    logChromeErrorMessage
  ));
}

async function createVoicesRadioMenuItems(
  menu: { id: string; title: string; parentId: string; contexts: string[] }
): Promise<void> {
  const voices    = await getTtsVoices();
  const voiceName = await getVoiceName();
  voices.forEach(voice => chrome.contextMenus.create(
    {
      parentId: menu.id,
      contexts: menu.contexts,
      type    : "radio",
      title   : `${voice.voiceName}`,
      id      : `${VOICES_SUBMENU_ID_KEY}${voice.voiceName}`,
      checked : voiceName === voice.voiceName
    },
    logChromeErrorMessage
  ));
}

async function createPitchRadioMenuItems(
  menu: { id: string; title: string; parentId: string; contexts: string[] }
): Promise<void> {
  const pitchFromStore = await getPitch();
  PITCH_OPTIONS.forEach(pitch => chrome.contextMenus.create(
    {
      parentId: menu.id,
      type    : "radio",
      contexts: menu.contexts,
      title   : `${pitch}`,
      id      : `${PITCH_SUBMENU_ID_KEY}${pitch}`,
      checked : pitchFromStore === Number(pitch)
    },
    logChromeErrorMessage
  ));
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
        .catch(logError);
      break;
    case SPEED_MENU_ID:
      storeRate(numberValueFrom(info.menuItemId))
        .catch(logError);
      break;
    case PITCH_MENU_ID:
      storePitch(numberValueFrom(info.menuItemId))
        .catch(logError);
      break;
    default:
      logError("ERROR: Invalid menu item parameter");
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
    .then(updateSubMenus)
    .catch(doNothing);
}

function updateSubMenus(result: VoiceStorageOptions): void {
  const MENU_IDS = [
    `${PITCH_SUBMENU_ID_KEY}${result.pitch}`,
    `${VOICES_SUBMENU_ID_KEY}${result.voiceName}`,
    `${SPEED_SUBMENU_ID_KEY}${result.rate}`
  ];
  MENU_IDS.forEach(id => chrome.contextMenus.update(
    id,
    { checked: true },
    logChromeErrorMessage
  ));
}

function resetToDefault(): void {
  chrome.storage.sync.clear(logChromeErrorMessage);
}
