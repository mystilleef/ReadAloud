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

// Mock chrome APIs that are not available in JSDOM
// This is a minimal mock, expand as needed for specific tests
Object.defineProperty(global, "chrome", {
  value: {
    runtime: {
      id: "read-aloud-extension-id",
      lastError: undefined,
      getURL: vi.fn((path) => `chrome-extension://test-id/${path}`),
      sendMessage: vi.fn(() => Promise.resolve()),
      onInstalled: createEvent(),
      getManifest: vi.fn(() => ({
        version: "0.0.1",
        manifest_version: 3,
        name: "ReadAloud",
      })),
      OnInstalledReason: {
        INSTALL: "install",
        UPDATE: "update",
      },
    },
    tts: {
      speak: vi.fn(),
      stop: vi.fn(),
      getVoices: vi.fn(),
      isSpeaking: vi.fn(),
    },
    commands: {
      onCommand: createEvent(),
    },
    action: {
      onClicked: createEvent(),
      setBadgeText: vi.fn(),
      setIcon: vi.fn(),
      setTitle: vi.fn(),
    },
    contextMenus: {
      create: vi.fn((_options, callback) => {
        if (callback) {
          callback();
        }
      }),
      update: vi.fn(),
      onClicked: createEvent(),
      ContextType: {
        ALL: "all",
      },
    },
    storage: {
      local: {
        // biome-ignore lint/suspicious/noExplicitAny: Chrome storage API mock requires flexible typing
        get: vi.fn(() => Promise.resolve({})) as any,
        // biome-ignore lint/suspicious/noExplicitAny: Chrome storage API mock requires flexible typing
        set: vi.fn(() => Promise.resolve()) as any,
        // biome-ignore lint/suspicious/noExplicitAny: Chrome storage API mock requires flexible typing
        clear: vi.fn(() => Promise.resolve()) as any,
      },
      sync: {
        // biome-ignore lint/suspicious/noExplicitAny: Chrome storage API mock requires flexible typing
        get: vi.fn(() => Promise.resolve({})) as any,
        // biome-ignore lint/suspicious/noExplicitAny: Chrome storage API mock requires flexible typing
        set: vi.fn(() => Promise.resolve()) as any,
        // biome-ignore lint/suspicious/noExplicitAny: Chrome storage API mock requires flexible typing
        clear: vi.fn(() => Promise.resolve()) as any,
      },
      onChanged: createEvent(),
    },
    tabs: {
      query: vi.fn(
        (_queryInfo, callback: (tabs: Array<{ id: number }>) => void) => {
          callback([{ id: 1 }]);
        },
      ),
      sendMessage: vi.fn(
        (_tabId, _message, _optionsOrCallback, callback?: () => void) => {
          if (typeof _optionsOrCallback === "function") {
            _optionsOrCallback();
          } else if (callback) {
            callback();
          }
        },
      ),
    },
  },
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
    }),
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
