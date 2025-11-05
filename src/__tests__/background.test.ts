/// <reference types="vitest/globals" />

import { beforeEach, describe, expect, it, vi } from "vitest";

// Create mocks
const mockCreateContextMenu = vi.fn();
const mockBadgeCounter = {
  increment: vi.fn(),
  decrement: vi.fn(),
  reset: vi.fn(),
  update: vi.fn(),
};
const mockReadStreamSubscribe = vi.fn();
const mockRefreshTtsStreamSubscribe = vi.fn();
const mockGotEndSpeakingStreamSubscribe = vi.fn();
const mockSendSelectedText = vi.fn();
const mockReadPhrases = vi.fn();
const mockRefresh = vi.fn();
const mockStop = vi.fn();
const mockGetSpeakOptions = vi.fn();
const mockStoreDefaultOptions = vi.fn();
const mockIsSpeaking = vi.fn();
const mockMessageToContentScript = vi.fn();
const mockSplitPhrases = vi.fn();

// Mock dependencies
vi.mock("../context", () => ({
  createContextMenu: mockCreateContextMenu,
}));

vi.mock("../counter", () => ({
  default: mockBadgeCounter,
}));

vi.mock("../error", () => ({
  logError: vi.fn(),
}));

vi.mock("../message", () => ({
  readStream: {
    pipe: vi.fn().mockReturnThis(),
    subscribe: mockReadStreamSubscribe,
  },
  refreshTtsStream: {
    pipe: vi.fn().mockReturnThis(),
    subscribe: mockRefreshTtsStreamSubscribe,
  },
  gotEndSpeakingStream: {
    pipe: vi.fn().mockReturnThis(),
    subscribe: mockGotEndSpeakingStreamSubscribe,
  },
  sendSelectedText: mockSendSelectedText,
}));

vi.mock("../reader", () => ({
  readPhrases: mockReadPhrases,
  refresh: mockRefresh,
  stop: mockStop,
}));

vi.mock("../storage", () => ({
  getSpeakOptions: mockGetSpeakOptions,
  storeDefaultOptions: mockStoreDefaultOptions,
}));

vi.mock("../utils", () => ({
  isSpeaking: mockIsSpeaking,
  messageToContentScript: mockMessageToContentScript,
  splitPhrases: mockSplitPhrases,
}));

describe("background", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    mockBadgeCounter.increment.mockResolvedValue(undefined);
    mockBadgeCounter.decrement.mockResolvedValue(undefined);
    mockBadgeCounter.reset.mockResolvedValue(undefined);
    mockBadgeCounter.update.mockResolvedValue(undefined);

    mockGetSpeakOptions.mockResolvedValue({});
    mockIsSpeaking.mockResolvedValue(false);
    mockReadPhrases.mockResolvedValue(undefined);
    mockRefresh.mockResolvedValue(undefined);
    mockStop.mockResolvedValue(undefined);
    mockSplitPhrases.mockResolvedValue([]);
    mockStoreDefaultOptions.mockResolvedValue(undefined);
    mockMessageToContentScript.mockResolvedValue(undefined);

    vi.resetModules();
    await import("../background");
  });

  describe("chrome event listeners", () => {
    it("should setup context menu on install", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: Mock event type requires any for dispatch
      await (chrome.runtime.onInstalled as any).dispatch({
        reason: "install",
      });

      expect(mockCreateContextMenu).toHaveBeenCalled();
    });

    it("should store default options on install", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: Mock event type requires any for dispatch
      await (chrome.runtime.onInstalled as any).dispatch({
        reason: "install",
      });

      expect(mockStoreDefaultOptions).toHaveBeenCalled();
    });

    it("should not store default options on update", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: Mock event type requires any for dispatch
      await (chrome.runtime.onInstalled as any).dispatch({
        reason: "update",
      });

      expect(mockStoreDefaultOptions).not.toHaveBeenCalled();
    });

    it("should send read selection message on command", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: Mock event type requires any for dispatch
      await (chrome.commands.onCommand as any).dispatch(
        "read_aloud_selected_text",
      );

      expect(mockMessageToContentScript).toHaveBeenCalledWith(
        mockSendSelectedText,
        {},
      );
    });

    it("should not send read selection message for other commands", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: Mock event type requires any for dispatch
      await (chrome.commands.onCommand as any).dispatch("other-command");

      expect(mockMessageToContentScript).not.toHaveBeenCalled();
    });

    it("should select text from content when not speaking on action click", async () => {
      mockIsSpeaking.mockResolvedValue(false);
      // biome-ignore lint/suspicious/noExplicitAny: Mock event type requires any for dispatch
      await (chrome.action.onClicked as any).dispatch({});

      expect(mockIsSpeaking).toHaveBeenCalled();
      expect(mockMessageToContentScript).toHaveBeenCalledWith(
        mockSendSelectedText,
        {},
      );
      expect(mockStop).not.toHaveBeenCalled();
      expect(mockBadgeCounter.reset).toHaveBeenCalled();
    });

    it("should stop speaking when speaking on action click", async () => {
      mockIsSpeaking.mockResolvedValue(true);
      // biome-ignore lint/suspicious/noExplicitAny: Mock event type requires any for dispatch
      await (chrome.action.onClicked as any).dispatch({});

      expect(mockIsSpeaking).toHaveBeenCalled();
      expect(mockStop).toHaveBeenCalled();
      expect(mockMessageToContentScript).not.toHaveBeenCalled();
      expect(mockBadgeCounter.reset).toHaveBeenCalled();
    });
  });

  describe("message stream subscriptions", () => {
    it("should read phrases from readStream", async () => {
      const listener = mockReadStreamSubscribe.mock.calls[0][0];
      await listener(["test text", { id: "read-aloud-extension-id" }]);

      expect(mockSplitPhrases).toHaveBeenCalledWith("test text");
      expect(mockBadgeCounter.increment).toHaveBeenCalled();
      expect(mockGetSpeakOptions).toHaveBeenCalled();
      expect(mockReadPhrases).toHaveBeenCalled();
    });

    it("should not read phrases from readStream if not from extension", async () => {
      const listener = mockReadStreamSubscribe.mock.calls[0][0];
      await listener(["test text", { id: "other-extension-id" }]);

      expect(mockReadPhrases).not.toHaveBeenCalled();
    });

    it("should refresh tts from refreshTtsStream", async () => {
      const listener = mockRefreshTtsStreamSubscribe.mock.calls[0][0];
      await listener([null, { id: "read-aloud-extension-id" }]);

      expect(mockRefresh).toHaveBeenCalled();
      expect(mockBadgeCounter.update).toHaveBeenCalled();
    });

    it("should not refresh tts from refreshTtsStream if not from extension", async () => {
      const listener = mockRefreshTtsStreamSubscribe.mock.calls[0][0];
      await listener([null, { id: "other-extension-id" }]);

      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("should decrement badge counter on gotEndSpeakingStream", async () => {
      const listener = mockGotEndSpeakingStreamSubscribe.mock.calls[0][0];
      await listener([null, { id: "read-aloud-extension-id" }]);

      expect(mockBadgeCounter.decrement).toHaveBeenCalled();
    });

    it("should not decrement badge counter on gotEndSpeakingStream if not from extension", async () => {
      const listener = mockGotEndSpeakingStreamSubscribe.mock.calls[0][0];
      await listener([null, { id: "other-extension-id" }]);

      expect(mockBadgeCounter.decrement).not.toHaveBeenCalled();
    });
  });
});
