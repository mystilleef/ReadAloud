/// <reference types="vitest/globals" />

import { beforeEach, describe, expect, it, vi } from "vitest";
import { EXTENSION_ID } from "../constants";
import { logError } from "../error";

// Mock the message module
const mockSendRead = vi.fn().mockResolvedValue(undefined);
const mockSendRefreshTts = vi.fn().mockResolvedValue(undefined);
const mockSendGotEndSpeaking = vi.fn().mockResolvedValue(undefined);

const mockStartedSpeakingStreamSubscribe = vi.fn();
const mockEndedSpeakingStreamSubscribe = vi.fn();
const mockSelectedTextStreamSubscribe = vi.fn();

vi.mock("../message", () => ({
  sendRead: mockSendRead,
  sendRefreshTts: mockSendRefreshTts,
  sendGotEndSpeaking: mockSendGotEndSpeaking,
  startedSpeakingStream: {
    subscribe: mockStartedSpeakingStreamSubscribe,
  },
  endedSpeakingStream: {
    subscribe: mockEndedSpeakingStreamSubscribe,
  },
  selectedTextStream: {
    subscribe: mockSelectedTextStreamSubscribe,
  },
}));

vi.mock("../error", () => ({
  logError: vi.fn(),
}));

// Store subscription callbacks
let startedSpeakingCallback:
  | ((args: [unknown, { id: string }]) => void)
  | null = null;
let endedSpeakingCallback: ((args: [unknown, { id: string }]) => void) | null =
  null;
let selectedTextCallback: ((args: [unknown, { id: string }]) => void) | null =
  null;

describe("content", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset DOM
    document.body.innerHTML = "";
    document.onselectionchange = null;

    // Capture subscription callbacks
    mockStartedSpeakingStreamSubscribe.mockImplementation((cb) => {
      startedSpeakingCallback = cb;
    });
    mockEndedSpeakingStreamSubscribe.mockImplementation((cb) => {
      endedSpeakingCallback = cb;
    });
    mockSelectedTextStreamSubscribe.mockImplementation((cb) => {
      selectedTextCallback = cb;
    });

    // Reset modules to force re-import and re-run script
    vi.resetModules();
    await import("../content");
  });

  describe("Selection Handling", () => {
    it("should send a read message after a selection change and timeout", () => {
      const selection = "Hello world";
      vi.spyOn(window, "getSelection").mockReturnValue({
        toString: () => selection,
      } as Selection);

      document.onselectionchange?.(new Event("selectionchange"));
      expect(mockSendRead).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(mockSendRead).toHaveBeenCalledWith(selection);
    });

    it("should not send a read message if selection is empty", () => {
      vi.spyOn(window, "getSelection").mockReturnValue({
        toString: () => "  ",
      } as Selection);

      document.onselectionchange?.(new Event("selectionchange"));
      vi.advanceTimersByTime(500);

      expect(mockSendRead).not.toHaveBeenCalled();
    });

    it("should debounce multiple selection changes", () => {
      const selection = "Final selection";
      vi.spyOn(window, "getSelection").mockReturnValue({
        toString: () => selection,
      } as Selection);

      document.onselectionchange?.(new Event("selectionchange"));
      vi.advanceTimersByTime(250);
      document.onselectionchange?.(new Event("selectionchange"));
      vi.advanceTimersByTime(250);
      document.onselectionchange?.(new Event("selectionchange"));
      vi.advanceTimersByTime(500);

      expect(mockSendRead).toHaveBeenCalledTimes(1);
      expect(mockSendRead).toHaveBeenCalledWith(selection);
    });

    it("should send a read message when selectedTextStream emits", () => {
      const selection = "From stream";
      vi.spyOn(window, "getSelection").mockReturnValue({
        toString: () => selection,
      } as Selection);

      selectedTextCallback?.([{}, { id: EXTENSION_ID }]);
      expect(mockSendRead).toHaveBeenCalledWith(selection);
    });

    it("should handle getSelection returning null", () => {
      vi.spyOn(window, "getSelection").mockReturnValue(null);
      document.onselectionchange?.(new Event("selectionchange"));
      vi.advanceTimersByTime(500);
      expect(mockSendRead).not.toHaveBeenCalled();
    });

    it("should log error if sendRead fails", () => {
      const error = new Error("Failed to send");
      mockSendRead.mockRejectedValue(error);
      const selection = "test";
      vi.spyOn(window, "getSelection").mockReturnValue({
        toString: () => selection,
      } as Selection);

      document.onselectionchange?.(new Event("selectionchange"));
      vi.advanceTimersByTime(500);

      // Need to wait for the promise to reject
      Promise.resolve().then(() => {
        expect(logError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe("TTS Refresh Logic", () => {
    it("should start refresh timer on startedSpeakingStream", () => {
      startedSpeakingCallback?.([{}, { id: EXTENSION_ID }]);
      expect(mockSendRefreshTts).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5000);
      expect(mockSendRefreshTts).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(5000);
      expect(mockSendRefreshTts).toHaveBeenCalledTimes(2);
    });

    it("should stop refresh timer on endedSpeakingStream", () => {
      startedSpeakingCallback?.([{}, { id: EXTENSION_ID }]);
      vi.advanceTimersByTime(2000);

      endedSpeakingCallback?.([{}, { id: EXTENSION_ID }]);
      vi.advanceTimersByTime(5000);

      expect(mockSendRefreshTts).not.toHaveBeenCalled();
    });

    it("should call sendGotEndSpeaking on endedSpeakingStream", () => {
      endedSpeakingCallback?.([{}, { id: EXTENSION_ID }]);
      expect(mockSendGotEndSpeaking).toHaveBeenCalled();
    });

    it("should log error if sendRefreshTts fails", async () => {
      const error = new Error("Refresh failed");
      mockSendRefreshTts.mockRejectedValue(error);

      startedSpeakingCallback?.([{}, { id: EXTENSION_ID }]);
      vi.advanceTimersByTime(5000);

      await Promise.resolve(); // allow promise to settle
      expect(logError).toHaveBeenCalledWith(error);
    });
  });

  describe("Security", () => {
    it("should ignore startedSpeakingStream from other extensions", () => {
      startedSpeakingCallback?.([{}, { id: "other-extension" }]);
      vi.advanceTimersByTime(5000);
      expect(mockSendRefreshTts).not.toHaveBeenCalled();
    });

    it("should ignore endedSpeakingStream from other extensions", () => {
      endedSpeakingCallback?.([{}, { id: "other-extension" }]);
      expect(mockSendGotEndSpeaking).not.toHaveBeenCalled();
    });

    it("should ignore selectedTextStream from other extensions", () => {
      selectedTextCallback?.([{}, { id: "other-extension" }]);
      expect(mockSendRead).not.toHaveBeenCalled();
    });
  });
});
