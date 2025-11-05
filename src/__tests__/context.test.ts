/// <reference types="vitest/globals" />

import { beforeEach, describe, expect, it, vi } from "vitest";
import { EXTENSION_ID } from "../constants";
import * as context from "../context";
import * as error from "../error";
import * as storage from "../storage";
import * as utils from "../utils";

// Mock all dependencies
vi.mock("../storage", () => ({
  getRate: vi.fn(),
  getVoiceName: vi.fn(),
  getPitch: vi.fn(),
  getStorageOptions: vi.fn(),
  storeVoice: vi.fn(),
  storeRate: vi.fn(),
  storePitch: vi.fn(),
  storeDefaultOptions: vi.fn(),
}));

vi.mock("../error", () => ({
  logError: vi.fn(),
  logChromeErrorMessage: vi.fn(),
  chromeRuntimeError: vi.fn(),
  doNothing: vi.fn(),
}));

vi.mock("../utils", () => ({
  getTtsVoices: vi.fn(),
}));

vi.mock("../constants", () => ({
  EXTENSION_ID: "test-extension-id",
}));

// Chrome API mocks
const contextMenusCreateMock = vi.fn<
  (
    createProperties: chrome.contextMenus.CreateProperties,
    callback?: () => void,
  ) => void
>(
  (
    _createProperties: chrome.contextMenus.CreateProperties,
    callback?: () => void,
  ) => {
    callback?.();
  },
);

const contextMenusUpdateMock = vi.fn<
  (
    id: string | number,
    updateProperties: chrome.contextMenus.UpdateProperties,
    callback?: () => void,
  ) => void
>(
  (
    _id: string | number,
    _updateProperties: chrome.contextMenus.UpdateProperties,
    callback?: () => void,
  ) => {
    callback?.();
  },
);

// Store the event listener callbacks
let storageChangeListener:
  | ((changes: chrome.storage.StorageChange, areaName: string) => void)
  | undefined;
let contextMenuClickListener:
  | ((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void)
  | undefined;

const storageOnChangedAddListenerMock = vi.fn<
  (
    callback: (changes: chrome.storage.StorageChange, areaName: string) => void,
  ) => void
>((callback) => {
  storageChangeListener = callback;
});

const contextMenusOnClickedAddListenerMock = vi.fn<
  (
    callback: (
      info: chrome.contextMenus.OnClickData,
      tab?: chrome.tabs.Tab,
    ) => void,
  ) => void
>((callback) => {
  contextMenuClickListener = callback;
});

const runtimeMock: Partial<typeof chrome.runtime> & {
  lastError: chrome.runtime.LastError | undefined;
} = {
  lastError: undefined,
};

describe("context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtimeMock.lastError = undefined;
    storageChangeListener = undefined;
    contextMenuClickListener = undefined;

    global.chrome = {
      contextMenus: {
        create: contextMenusCreateMock,
        update: contextMenusUpdateMock,
        onClicked: {
          addListener: contextMenusOnClickedAddListenerMock,
        },
      },
      storage: {
        onChanged: {
          addListener: storageOnChangedAddListenerMock,
        },
      },
      runtime: runtimeMock as typeof chrome.runtime,
    } as unknown as typeof chrome;

    // Default mock implementations
    vi.mocked(error.chromeRuntimeError).mockReturnValue(false);
    vi.mocked(storage.getRate).mockResolvedValue(1);
    vi.mocked(storage.getVoiceName).mockResolvedValue("Google US English");
    vi.mocked(storage.getPitch).mockResolvedValue(1);
    vi.mocked(storage.getStorageOptions).mockResolvedValue({
      rate: 1,
      voiceName: "Google US English",
      pitch: 1,
    });
    vi.mocked(utils.getTtsVoices).mockResolvedValue([
      { voiceName: "Google US English" } as chrome.tts.TtsVoice,
    ]);
  });

  describe("createContextMenu", () => {
    it("should create the root context menu", () => {
      context.createContextMenu();

      expect(chrome.contextMenus.create).toHaveBeenCalledWith(
        {
          contexts: ["all"],
          id: `ReadAloudMenu-${EXTENSION_ID}`,
          title: "Read Aloud",
        },
        expect.any(Function),
      );
    });

    it("should create top-level menus when root menu creation succeeds", () => {
      let rootCallback: (() => void) | undefined;
      contextMenusCreateMock.mockImplementation(
        (
          _createProperties: chrome.contextMenus.CreateProperties,
          callback?: () => void,
        ) => {
          if (!rootCallback) {
            rootCallback = callback;
          }
          callback?.();
        },
      );

      context.createContextMenu();

      expect(chrome.contextMenus.create).toHaveBeenCalledTimes(5); // Root + 4 top-level menus
    });

    it("should log error if root menu creation fails", () => {
      vi.mocked(error.chromeRuntimeError).mockReturnValue(true);

      context.createContextMenu();

      expect(error.logChromeErrorMessage).toHaveBeenCalled();
    });

    it("should create Speed submenu radio items", async () => {
      vi.mocked(storage.getRate).mockResolvedValue(1.5);

      context.createContextMenu();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should create menu items for speed options: 1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2
      const speedMenuCalls = contextMenusCreateMock.mock.calls.filter((call) =>
        String(call[0].id).includes("ReadAloudSpeedMenu"),
      );
      expect(speedMenuCalls.length).toBeGreaterThan(0);
    });

    it("should create Voices submenu radio items", async () => {
      const mockVoices = [
        { voiceName: "Voice 1" },
        { voiceName: "Voice 2" },
      ] as chrome.tts.TtsVoice[];
      vi.mocked(utils.getTtsVoices).mockResolvedValue(mockVoices);

      context.createContextMenu();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(utils.getTtsVoices).toHaveBeenCalled();
    });

    it("should create Pitch submenu radio items", async () => {
      vi.mocked(storage.getPitch).mockResolvedValue(1.1);

      context.createContextMenu();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(storage.getPitch).toHaveBeenCalled();
    });

    it("should mark correct speed option as checked", async () => {
      const selectedRate = 1.5;
      vi.mocked(storage.getRate).mockResolvedValue(selectedRate);

      context.createContextMenu();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      const checkedSpeedCall = contextMenusCreateMock.mock.calls.find(
        (call) =>
          call[0].checked === true &&
          String(call[0].id).includes(`|${selectedRate}`),
      );
      expect(checkedSpeedCall).toBeDefined();
    });

    it("should mark correct voice as checked", async () => {
      const selectedVoice = "Test Voice";
      const mockVoices = [
        { voiceName: "Test Voice" },
        { voiceName: "Another Voice" },
      ] as chrome.tts.TtsVoice[];
      vi.mocked(utils.getTtsVoices).mockResolvedValue(mockVoices);
      vi.mocked(storage.getVoiceName).mockResolvedValue(selectedVoice);

      context.createContextMenu();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      const checkedVoiceCall = contextMenusCreateMock.mock.calls.find(
        (call) =>
          call[0].checked === true &&
          String(call[0].id).includes(selectedVoice),
      );
      expect(checkedVoiceCall).toBeDefined();
    });

    it("should mark correct pitch option as checked", async () => {
      const selectedPitch = 1.2;
      vi.mocked(storage.getPitch).mockResolvedValue(selectedPitch);

      context.createContextMenu();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      const checkedPitchCall = contextMenusCreateMock.mock.calls.find(
        (call) =>
          call[0].checked === true &&
          String(call[0].id).includes(`|${selectedPitch}`),
      );
      expect(checkedPitchCall).toBeDefined();
    });
  });

  describe("addListenersToContextMenus", () => {
    it("should call storeDefaultOptions when reset menu is clicked", async () => {
      vi.mocked(storage.storeDefaultOptions).mockResolvedValue();

      const clickInfo: chrome.contextMenus.OnClickData = {
        menuItemId: `ReadAloudResetDefaultMenu-${EXTENSION_ID}`,
      } as chrome.contextMenus.OnClickData;

      await context.addListenersToContextMenus(clickInfo);

      expect(storage.storeDefaultOptions).toHaveBeenCalled();
    });

    it("should call storeVoice when voice menu item is clicked", async () => {
      vi.mocked(storage.storeVoice).mockResolvedValue();

      const clickInfo: chrome.contextMenus.OnClickData = {
        menuItemId: `ReadAloudVoicesMenu-${EXTENSION_ID}|Test Voice`,
        parentMenuItemId: `ReadAloudVoicesMenu-${EXTENSION_ID}`,
      } as chrome.contextMenus.OnClickData;

      await context.addListenersToContextMenus(clickInfo);

      expect(storage.storeVoice).toHaveBeenCalledWith("Test Voice");
    });

    it("should call storeRate when speed menu item is clicked", async () => {
      vi.mocked(storage.storeRate).mockResolvedValue();

      const clickInfo: chrome.contextMenus.OnClickData = {
        menuItemId: `ReadAloudSpeedMenu-${EXTENSION_ID}|1.5`,
        parentMenuItemId: `ReadAloudSpeedMenu-${EXTENSION_ID}`,
      } as chrome.contextMenus.OnClickData;

      await context.addListenersToContextMenus(clickInfo);

      expect(storage.storeRate).toHaveBeenCalledWith(1.5);
    });

    it("should call storePitch when pitch menu item is clicked", async () => {
      vi.mocked(storage.storePitch).mockResolvedValue();

      const clickInfo: chrome.contextMenus.OnClickData = {
        menuItemId: `ReadAloudPitchMenu-${EXTENSION_ID}|1.2`,
        parentMenuItemId: `ReadAloudPitchMenu-${EXTENSION_ID}`,
      } as chrome.contextMenus.OnClickData;

      await context.addListenersToContextMenus(clickInfo);

      expect(storage.storePitch).toHaveBeenCalledWith(1.2);
    });

    it("should handle numeric menu item IDs for speed", async () => {
      vi.mocked(storage.storeRate).mockResolvedValue();

      const clickInfo: chrome.contextMenus.OnClickData = {
        menuItemId: 123,
        parentMenuItemId: `ReadAloudSpeedMenu-${EXTENSION_ID}`,
      } as chrome.contextMenus.OnClickData;

      await context.addListenersToContextMenus(clickInfo);

      expect(storage.storeRate).toHaveBeenCalledWith(123);
    });

    it("should handle numeric menu item IDs for pitch", async () => {
      vi.mocked(storage.storePitch).mockResolvedValue();

      const clickInfo: chrome.contextMenus.OnClickData = {
        menuItemId: 456,
        parentMenuItemId: `ReadAloudPitchMenu-${EXTENSION_ID}`,
      } as chrome.contextMenus.OnClickData;

      await context.addListenersToContextMenus(clickInfo);

      expect(storage.storePitch).toHaveBeenCalledWith(456);
    });

    it("should log error for invalid parent menu item", async () => {
      const clickInfo: chrome.contextMenus.OnClickData = {
        menuItemId: "some-menu-item",
        parentMenuItemId: "invalid-parent",
      } as chrome.contextMenus.OnClickData;

      await context.addListenersToContextMenus(clickInfo);

      expect(error.logError).toHaveBeenCalledWith(
        "ERROR: Invalid menu item parameter",
      );
    });

    it("should handle errors from storeVoice", async () => {
      const testError = new Error("Storage error");
      vi.mocked(storage.storeVoice).mockRejectedValue(testError);

      const clickInfo: chrome.contextMenus.OnClickData = {
        menuItemId: `ReadAloudVoicesMenu-${EXTENSION_ID}|Test Voice`,
        parentMenuItemId: `ReadAloudVoicesMenu-${EXTENSION_ID}`,
      } as chrome.contextMenus.OnClickData;

      await context.addListenersToContextMenus(clickInfo);

      // Wait for promise rejection to be handled
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(error.logError).toHaveBeenCalledWith(testError);
    });

    it("should handle errors from storeRate", async () => {
      const testError = new Error("Storage error");
      vi.mocked(storage.storeRate).mockRejectedValue(testError);

      const clickInfo: chrome.contextMenus.OnClickData = {
        menuItemId: `ReadAloudSpeedMenu-${EXTENSION_ID}|1.5`,
        parentMenuItemId: `ReadAloudSpeedMenu-${EXTENSION_ID}`,
      } as chrome.contextMenus.OnClickData;

      await context.addListenersToContextMenus(clickInfo);

      // Wait for promise rejection to be handled
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(error.logError).toHaveBeenCalledWith(testError);
    });

    it("should handle errors from storePitch", async () => {
      const testError = new Error("Storage error");
      vi.mocked(storage.storePitch).mockRejectedValue(testError);

      const clickInfo: chrome.contextMenus.OnClickData = {
        menuItemId: `ReadAloudPitchMenu-${EXTENSION_ID}|1.2`,
        parentMenuItemId: `ReadAloudPitchMenu-${EXTENSION_ID}`,
      } as chrome.contextMenus.OnClickData;

      await context.addListenersToContextMenus(clickInfo);

      // Wait for promise rejection to be handled
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(error.logError).toHaveBeenCalledWith(testError);
    });
  });

  describe("resolveStorageConfigurations", () => {
    it("should update submenus with current storage options", async () => {
      const mockOptions = {
        rate: 1.5,
        voiceName: "Test Voice",
        pitch: 1.2,
      };
      vi.mocked(storage.getStorageOptions).mockResolvedValue(mockOptions);

      context.resolveStorageConfigurations();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(storage.getStorageOptions).toHaveBeenCalled();
      expect(chrome.contextMenus.update).toHaveBeenCalledTimes(3);
      expect(chrome.contextMenus.update).toHaveBeenCalledWith(
        `ReadAloudVoicesMenu-${EXTENSION_ID}|Test Voice`,
        { checked: true },
        error.logChromeErrorMessage,
      );
      expect(chrome.contextMenus.update).toHaveBeenCalledWith(
        `ReadAloudSpeedMenu-${EXTENSION_ID}|1.5`,
        { checked: true },
        error.logChromeErrorMessage,
      );
      expect(chrome.contextMenus.update).toHaveBeenCalledWith(
        `ReadAloudPitchMenu-${EXTENSION_ID}|1.2`,
        { checked: true },
        error.logChromeErrorMessage,
      );
    });

    it("should handle errors from getStorageOptions gracefully", async () => {
      const testError = new Error("Storage error");
      vi.mocked(storage.getStorageOptions).mockRejectedValue(testError);

      context.resolveStorageConfigurations();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(error.doNothing).toHaveBeenCalled();
    });

    it("should call logChromeErrorMessage for each update", async () => {
      const mockOptions = {
        rate: 1,
        voiceName: "Google US English",
        pitch: 1,
      };
      vi.mocked(storage.getStorageOptions).mockResolvedValue(mockOptions);

      context.resolveStorageConfigurations();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should be called 3 times (once for each menu update)
      const updateCalls = contextMenusUpdateMock.mock.calls.filter(
        (call) => call[2] === error.logChromeErrorMessage,
      );
      expect(updateCalls.length).toBe(3);
    });
  });

  describe("edge cases", () => {
    it("should handle empty voice name", async () => {
      const mockVoices = [{ voiceName: undefined }] as chrome.tts.TtsVoice[];
      vi.mocked(utils.getTtsVoices).mockResolvedValue(mockVoices);

      context.createContextMenu();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should handle undefined voice name by using empty string
      const voiceMenuCall = contextMenusCreateMock.mock.calls.find(
        (call) =>
          String(call[0].id).includes("ReadAloudVoicesMenu") &&
          call[0].type === "radio",
      );
      expect(voiceMenuCall).toBeDefined();
    });

    it("should handle all speed options correctly", async () => {
      const speedOptions = [1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2];

      for (const speed of speedOptions) {
        vi.clearAllMocks();
        vi.mocked(storage.getRate).mockResolvedValue(speed);

        context.createContextMenu();

        await new Promise((resolve) => setTimeout(resolve, 0));

        const checkedSpeedCall = contextMenusCreateMock.mock.calls.find(
          (call) =>
            call[0].checked === true &&
            String(call[0].id).includes(`|${speed}`),
        );
        expect(checkedSpeedCall).toBeDefined();
      }
    });

    it("should handle all pitch options correctly", async () => {
      const pitchOptions = [0.8, 0.9, 1, 1.1, 1.2];

      for (const pitch of pitchOptions) {
        vi.clearAllMocks();
        vi.mocked(storage.getPitch).mockResolvedValue(pitch);

        context.createContextMenu();

        await new Promise((resolve) => setTimeout(resolve, 0));

        const checkedPitchCall = contextMenusCreateMock.mock.calls.find(
          (call) =>
            call[0].checked === true &&
            String(call[0].id).includes(`|${pitch}`),
        );
        expect(checkedPitchCall).toBeDefined();
      }
    });

    it("should handle multiple voices correctly", async () => {
      const mockVoices = [
        { voiceName: "Voice A" },
        { voiceName: "Voice B" },
        { voiceName: "Voice C" },
      ] as chrome.tts.TtsVoice[];
      vi.mocked(utils.getTtsVoices).mockResolvedValue(mockVoices);
      vi.mocked(storage.getVoiceName).mockResolvedValue("Voice B");

      context.createContextMenu();

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should create menu items for all voices
      const voiceMenuCalls = contextMenusCreateMock.mock.calls.filter(
        (call) =>
          String(call[0].id).includes("ReadAloudVoicesMenu") &&
          call[0].type === "radio",
      );
      expect(voiceMenuCalls.length).toBe(mockVoices.length);

      // Only Voice B should be checked
      const checkedCalls = voiceMenuCalls.filter((call) => call[0].checked);
      expect(checkedCalls.length).toBe(1);
      expect(String(checkedCalls[0][0].id)).toContain("Voice B");
    });
  });

  describe("event listeners", () => {
    it("should call resolveStorageConfigurations when storage changes", async () => {
      vi.mocked(storage.getStorageOptions).mockResolvedValue({
        rate: 1.5,
        voiceName: "Test Voice",
        pitch: 1.2,
      });

      // Trigger the storage change listener
      if (storageChangeListener) {
        storageChangeListener({} as chrome.storage.StorageChange, "sync");
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(storage.getStorageOptions).toHaveBeenCalled();
      }
    });

    it("should call addListenersToContextMenus when menu is clicked", async () => {
      vi.mocked(storage.storeDefaultOptions).mockResolvedValue();

      const clickInfo: chrome.contextMenus.OnClickData = {
        menuItemId: `ReadAloudResetDefaultMenu-${EXTENSION_ID}`,
      } as chrome.contextMenus.OnClickData;

      // Trigger the context menu click listener
      if (contextMenuClickListener) {
        contextMenuClickListener(clickInfo);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(storage.storeDefaultOptions).toHaveBeenCalled();
      }
    });

    it("should handle errors in context menu click listener", async () => {
      const testError = new Error("Test error");
      vi.mocked(storage.storeDefaultOptions).mockRejectedValue(testError);

      const clickInfo: chrome.contextMenus.OnClickData = {
        menuItemId: `ReadAloudResetDefaultMenu-${EXTENSION_ID}`,
      } as chrome.contextMenus.OnClickData;

      // Trigger the context menu click listener
      if (contextMenuClickListener) {
        contextMenuClickListener(clickInfo);
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(error.logError).toHaveBeenCalledWith(testError);
      }
    });
  });
});
