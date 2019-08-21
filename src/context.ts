import { setPitch, setRate, setVoiceName } from "./reader";

const readAloudSpeedMenuIdKey = "ReadAloud|Speed|Menu|Option|";
const readAloudPitchMenuIdKey = "ReadAloud|Pitch|Menu|Option|";
const readAloudLangMenuIdKey  = "ReadAloud|Lang|Menu|Option|";
const menus                   = [
  {
    title   : "Speed",
    parentId: "ReadAloudMenu",
    id      : "ReadAloudSpeedMenu",
    contexts: ["all"]
  },
  {
    title   : "Voices",
    parentId: "ReadAloudMenu",
    id      : "ReadAloudLanguageMenu",
    contexts: ["all"]
  },
  {
    title   : "Pitch",
    parentId: "ReadAloudMenu",
    id      : "ReadAloudPitchMenu",
    contexts: ["all"]
  },
  {
    title   : "Reset to Default",
    parentId: "ReadAloudMenu",
    id      : "ReadAloudResetDefaultMenu",
    contexts: ["all"]
  }
];

const speedOptions = ["1.0", "1.2", "1.4", "1.6", "1.8", "2.0"];
const pitchOptions = ["0", "0.5", "1.0", "1.5", "2.0"];

chrome.contextMenus.create(
  { title: "Read Aloud", id: "ReadAloudMenu", contexts: ["all"] },
  () => {
    if (runtimeError()) logRuntimeError();
    else menus.forEach(menu => someMenu(menu));
  }
);

function someMenu(
  menu: { id: string; title: string; parentId: string }
): void {
  // noinspection FunctionTooLongJS
  chrome.contextMenus.create(
    menu,
    () => {
      if (runtimeError()) logRuntimeError();
      if (menu.id === "ReadAloudSpeedMenu") createSpeedSubMenus();
      else if (menu.id === "ReadAloudLanguageMenu") createLanguageSubMenus();
      else if (menu.id === "ReadAloudPitchMenu") createPitchSubMenus();
    }
  );
}

function createSpeedSubMenus(): void {
  speedOptions.forEach(speed => chrome.contextMenus.create(
    {
      parentId: "ReadAloudSpeedMenu",
      contexts: ["all"],
      type    : "radio",
      title   : `${speed}x`,
      id      : `${readAloudSpeedMenuIdKey}${speed}`
    },
    () => logRuntimeError()
  ));
}

function createLanguageSubMenus(): void {
  chrome.tts.getVoices((voices: chrome.tts.TtsVoice[]) => {
    voices.forEach(voice => chrome.contextMenus.create(
      {
        parentId: "ReadAloudLanguageMenu",
        contexts: ["all"],
        type    : "radio",
        title   : `${voice.voiceName}`,
        id      : `${readAloudLangMenuIdKey}${voice.voiceName}`
      },
      () => logRuntimeError()
    ));
  });
}

function createPitchSubMenus(): void {
  pitchOptions.forEach(pitch => chrome.contextMenus.create(
    {
      parentId: "ReadAloudPitchMenu",
      type    : "radio",
      contexts: ["all"],
      title   : `${pitch}`,
      id      : `${readAloudPitchMenuIdKey}${pitch}`
    },
    () => logRuntimeError()
  ));
}

function runtimeError(): boolean {
  return !!chrome.runtime.lastError;
}

function logRuntimeError(): void {
  if (chrome.runtime.lastError)
    console.log(`Error: ${chrome.runtime.lastError.message}`);
}

function resetToDefault(): void {
  chrome.storage.sync.clear(() => logRuntimeError());
}

chrome.contextMenus.onClicked.addListener((info, _tab) => {
  if (info.menuItemId === "ReadAloudResetDefaultMenu") resetToDefault();
  else handleRadioMenuItems(info);
});

// noinspection FunctionTooLongJS
function handleRadioMenuItems(info: chrome.contextMenus.OnClickData): void {
  switch (info.parentMenuItemId) {
    case "ReadAloudSpeedMenu":
      setRate(valueFrom(info.menuItemId));
      break;
    case "ReadAloudLanguageMenu":
      setVoiceName(valueFromString(info.menuItemId));
      break;
    case "ReadAloudPitchMenu":
      setPitch(valueFrom(info.menuItemId));
      break;
    default:
      console.error("ERROR: Invalid menu item parameter");
  }
}

function valueFrom(id: string): number {
  return Number(id.split("|").pop());
}

function valueFromString(id: string): string {
  return id.split("|").pop() || "Google UK English Female";
}
