import { vi } from "vitest";

type EventListener = (...args: unknown[]) => void;

interface MockEvent {
  addListener: (listener: EventListener) => void;
  removeListener: (listener: EventListener) => void;
  dispatch: (...args: unknown[]) => Promise<void>;
}

// Mock chrome APIs that are not available in JSDOM
// This is a minimal mock, expand as needed for specific tests
const createEvent = (): MockEvent => {
  const listeners = new Set<EventListener>();
  return {
    addListener: (listener: EventListener) => {
      listeners.add(listener);
    },
    removeListener: (listener: EventListener) => {
      listeners.delete(listener);
    },
    dispatch: async (...args: unknown[]) => {
      for (const listener of listeners) {
        await listener(...args);
      }
    },
  };
};

const chromeMock: Partial<typeof chrome> = {
  runtime: {
    id: "read-aloud-extension-id",
    lastError: undefined,
    getURL: vi.fn((path) => `chrome-extension://test-id/${path}`),
    sendMessage: vi.fn(() => Promise.resolve()),
    onInstalled: createEvent() as unknown as chrome.events.Event<
      (details: chrome.runtime.InstalledDetails) => void
    >,
    getManifest: vi.fn(() => ({
      version: "0.0.1",
      manifest_version: 3,
      name: "ReadAloud",
    })) as unknown as () => chrome.runtime.Manifest,
    OnInstalledReason: {
      INSTALL: "install",
      UPDATE: "update",
      CHROME_UPDATE: "chrome_update",
      SHARED_MODULE_UPDATE: "shared_module_update",
    } as unknown as typeof chrome.runtime.OnInstalledReason,
  } as unknown as typeof chrome.runtime,
  tts: {
    speak: vi.fn(),
    stop: vi.fn(),
    getVoices: vi.fn(),
    isSpeaking: vi.fn(),
  } as unknown as typeof chrome.tts,
  commands: {
    onCommand: createEvent() as unknown as chrome.events.Event<
      (command: string, tab?: chrome.tabs.Tab) => void
    >,
  } as unknown as typeof chrome.commands,
  action: {
    onClicked: createEvent() as unknown as chrome.events.Event<
      (tab: chrome.tabs.Tab) => void
    >,
    setBadgeText: vi.fn(),
    setIcon: vi.fn(),
    setTitle: vi.fn(),
  } as unknown as typeof chrome.action,
  contextMenus: {
    create: vi.fn((_options, callback) => {
      if (callback) {
        callback();
      }
    }),
    update: vi.fn(),
    onClicked: createEvent() as unknown as chrome.events.Event<
      (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void
    >,
    ContextType: {
      ALL: "all",
    } as unknown as typeof chrome.contextMenus.ContextType,
  } as unknown as typeof chrome.contextMenus,
  storage: {
    local: {
      get: vi.fn(() => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
      clear: vi.fn(() => Promise.resolve()),
    } as unknown as chrome.storage.LocalStorageArea,
    sync: {
      get: vi.fn(() => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
      clear: vi.fn(() => Promise.resolve()),
    } as unknown as chrome.storage.SyncStorageArea,
    onChanged: createEvent() as unknown as chrome.events.Event<
      (
        changes: { [key: string]: chrome.storage.StorageChange },
        areaName: chrome.storage.AreaName,
      ) => void
    >,
  } as unknown as typeof chrome.storage,
  tabs: {
    query: vi.fn(
      (_queryInfo, callback: (tabs: Array<{ id: number }>) => void) => {
        callback([{ id: 1 }]);
      },
    ) as unknown as (
      queryInfo: chrome.tabs.QueryInfo,
      callback: (result: chrome.tabs.Tab[]) => void,
    ) => void,
    sendMessage: vi.fn(
      (_tabId, _message, _optionsOrCallback, callback?: () => void) => {
        if (typeof _optionsOrCallback === "function") {
          _optionsOrCallback();
        } else if (callback) {
          callback();
        }
      },
    ) as unknown as (
      tabId: number,
      message: unknown,
      optionsOrCallback: unknown,
      callback?: () => void,
    ) => void,
  } as unknown as typeof chrome.tabs,
};

// Mock chrome APIs that are not available in JSDOM
Object.defineProperty(global, "chrome", {
  value: chromeMock,
  writable: true,
});

class MockAudio {
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn(() => Promise.resolve());
  src = "";
  playbackRate = 1;
  onended = () => {};
  ended = true;
  paused = true;
}

Object.defineProperty(global, "Audio", {
  writable: true,
  value: MockAudio,
});

// Mock the fetch API for getVoices in utils.ts
Object.defineProperty(global, "fetch", {
  value: vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          {
            name: "en-US-Studio-O",
            languageCodes: ["en-US"],
            ssmlGender: "FEMALE",
          },
          {
            name: "en-GB-Standard-C",
            languageCodes: ["en-GB"],
            ssmlGender: "MALE",
          },
          { name: "David", languageCodes: ["en-US"], ssmlGender: "MALE" }, // Singular name example
        ]),
    } as Response),
  ),
  writable: true,
});

// Mock URL.createObjectURL and URL.revokeObjectURL for player tests
Object.defineProperty(global.URL, "createObjectURL", {
  writable: true,
  value: vi.fn(() => "blob:http://example.com/test"),
});

Object.defineProperty(global.URL, "revokeObjectURL", {
  writable: true,
  value: vi.fn(),
});
