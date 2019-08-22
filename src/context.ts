/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DEFAULT_VOICENAME,
  PITCH,
  RATE,
  setPitch,
  setRate,
  setVoiceName,
  VOICENAME
} from "./reader";

const SPEED_MENU_ID           = "ReadAloudSpeedMenu";
const SPEED_MENU_ID_KEY       = "ReadAloud|Speed|Menu|Option|";
const PITCH_MENU_ID           = "ReadAloudPitchMenu";
const PITCH_MENU_ID_KEY       = "ReadAloud|Pitch|Menu|Option|";
const VOICES_MENU_ID          = "ReadAloudVoicesMenu";
const VOICES_MENU_ID_KEY      = "ReadAloud|Voices|Menu|Option|";
const READ_ALOUD_ROOT_MENU_ID = "ReadAloudMenu";
const RESET_DEFAULT_MENU_ID   = "ReadAloudResetDefaultMenu";

const TOP_LEVEL_MENU_INFO = [
  {
    title   : "Speed",
    parentId: READ_ALOUD_ROOT_MENU_ID,
    id      : SPEED_MENU_ID,
    contexts: ["all"]
  },
  {
    title   : "Voices",
    parentId: READ_ALOUD_ROOT_MENU_ID,
    id      : VOICES_MENU_ID,
    contexts: ["all"]
  },
  {
    title   : "Pitch",
    parentId: READ_ALOUD_ROOT_MENU_ID,
    id      : PITCH_MENU_ID,
    contexts: ["all"]
  },
  {
    title   : "Reset to Default",
    parentId: READ_ALOUD_ROOT_MENU_ID,
    id      : RESET_DEFAULT_MENU_ID,
    contexts: ["all"]
  }
];

const speedOptions = [1, 1.2, 1.4, 1.6, 1.8, 2];
const pitchOptions = [0, 0.5, 1, 1.5, 2];

chrome.contextMenus.create(
  { title: "Read Aloud", id: READ_ALOUD_ROOT_MENU_ID, contexts: ["all"] },
  () => {
    if (runtimeError()) logRuntimeError();
    else TOP_LEVEL_MENU_INFO.forEach(menu => createTopLevelMenus(menu));
  }
);

function createTopLevelMenus(
  menu: { id: string; title: string; parentId: string; contexts: string[] }
): void {
  // noinspection FunctionTooLongJS
  chrome.contextMenus.create(
    menu,
    () => {
      if (runtimeError()) logRuntimeError();
      switch (menu.id) {
        case SPEED_MENU_ID:
          createSpeedSubMenus(menu);
          break;
        case VOICES_MENU_ID:
          createLanguageSubMenus(menu);
          break;
        case PITCH_MENU_ID:
          createPitchSubMenus(menu);
          break;
        default:
          break;
      }
    }
  );
}

function createSpeedSubMenus(
  menu: { id: string; title: string; parentId: string; contexts: string[] }
): void {
  chrome.storage.sync.get(RATE, items => {
    speedOptions.forEach(speed => chrome.contextMenus.create(
      {
        parentId: menu.id,
        contexts: menu.contexts,
        type    : "radio",
        title   : `${speed}x`,
        id      : `${SPEED_MENU_ID_KEY}${speed}`,
        checked : items.rate === Number(speed)
      },
      () => logRuntimeError()
    ));
  });
}

function createLanguageSubMenus(
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
          id      : `${VOICES_MENU_ID_KEY}${voice.voiceName}`,
          checked : items.voiceName === voice.voiceName
        },
        () => logRuntimeError()
      ));
    });
  });
}

function createPitchSubMenus(
  menu: { id: string; title: string; parentId: string; contexts: string[] }
): void {
  chrome.storage.sync.get(PITCH, items => {
    pitchOptions.forEach(pitch => chrome.contextMenus.create(
      {
        parentId: menu.id,
        type    : "radio",
        contexts: menu.contexts,
        title   : `${pitch}`,
        id      : `${PITCH_MENU_ID_KEY}${pitch}`,
        checked : items.pitch === Number(pitch)
      },
      () => logRuntimeError()
    ));
  });
}

function runtimeError(): boolean {
  return !!chrome.runtime.lastError;
}

function logRuntimeError(): void {
  if (chrome.runtime.lastError)
    console.log(`Error: ${chrome.runtime.lastError.message}`);
}

chrome.contextMenus.onClicked.addListener((info, _tab) => {
  if (info.menuItemId === RESET_DEFAULT_MENU_ID) resetToDefault();
  else handleRadioMenuItems(info);
});

function resetToDefault(): void {
  chrome.storage.sync.clear(() => logRuntimeError());
}

// noinspection FunctionTooLongJS
function handleRadioMenuItems(info: chrome.contextMenus.OnClickData): void {
  switch (info.parentMenuItemId) {
    case SPEED_MENU_ID:
      setRate(numberValueFrom(info.menuItemId));
      break;
    case VOICES_MENU_ID:
      setVoiceName(stringValueFrom(info.menuItemId));
      break;
    case PITCH_MENU_ID:
      setPitch(numberValueFrom(info.menuItemId));
      break;
    default:
      console.error("ERROR: Invalid menu item parameter");
  }
}

function configurationStoreIsEmpty(
  items: { [x: string]: any }
): boolean {
  return items.pitch === undefined
         || items.voiceName === undefined
         || items.rate === undefined;
}

chrome.storage.onChanged.addListener((
  _changes: chrome.storage.StorageChange,
  _areaName: string
) => {
  chrome.storage.sync.get([PITCH, VOICENAME, RATE], items => {
    if (configurationStoreIsEmpty(items)) return;
    chrome.contextMenus.update(
      `${PITCH_MENU_ID_KEY}${items.pitch}`,
      { checked: true },
      () => logRuntimeError()
    );
    chrome.contextMenus.update(
      `${VOICES_MENU_ID_KEY}${items.voiceName}`,
      { checked: true },
      () => logRuntimeError()
    );
    chrome.contextMenus.update(
      `${SPEED_MENU_ID_KEY}${items.rate}`,
      { checked: true },
      () => logRuntimeError()
    );
  });
});

function numberValueFrom(id: string): number {
  return Number(id.split("|").pop());
}

function stringValueFrom(id: string): string {
  return id.split("|").pop() || DEFAULT_VOICENAME;
}
