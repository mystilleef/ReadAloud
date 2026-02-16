/// <reference types="vitest/globals" />

import { beforeEach, describe, expect, it, vi } from "vitest";
import * as error from "../error";
import * as message from "../message";
import { onTtsEvent, readTts, refreshTts, stopTts } from "../ttshandler";
import * as utils from "../utils";

vi.mock("../message", () => ({
  sendEndedSpeaking: vi.fn(),
  sendFinishedSpeaking: vi.fn(),
  sendStartedSpeaking: vi.fn(),
}));

vi.mock("../utils", () => ({
  messageToContentScript: vi.fn(),
  refresh: vi.fn(),
  speak: vi.fn(),
  splitPhrases: vi.fn(),
  stop: vi.fn(),
}));

describe("ttshandler", () => {
  const logErrorSpy = vi.spyOn(error, "logError");
  const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

  beforeEach(() => {
    vi.clearAllMocks();
    logErrorSpy.mockImplementation(() => undefined);
    vi.mocked(message.sendEndedSpeaking).mockResolvedValue(undefined);
    vi.mocked(message.sendFinishedSpeaking).mockResolvedValue(undefined);
    vi.mocked(message.sendStartedSpeaking).mockResolvedValue(undefined);
    vi.mocked(utils.messageToContentScript).mockResolvedValue(undefined);
    vi.mocked(utils.refresh).mockResolvedValue(undefined);
    vi.mocked(utils.speak).mockResolvedValue(undefined);
    vi.mocked(utils.splitPhrases).mockResolvedValue([]);
    vi.mocked(utils.stop).mockResolvedValue(undefined);
  });

  describe("readTts", () => {
    it("should split phrases and call speak for each", async () => {
      const utterances = "hello world";
      const phrases = ["hello", "world"];
      const options = { voiceName: "test" };
      vi.mocked(utils.splitPhrases).mockResolvedValue(phrases);

      await readTts(utterances, options);

      expect(utils.splitPhrases).toHaveBeenCalledWith(utterances);
      expect(utils.speak).toHaveBeenCalledTimes(2);
      expect(utils.speak).toHaveBeenCalledWith("hello", {
        ...options,
        onEvent: onTtsEvent,
      });
      expect(utils.speak).toHaveBeenCalledWith("world", {
        ...options,
        onEvent: onTtsEvent,
      });
    });

    it("should not call speak for empty utterances", async () => {
      vi.mocked(utils.splitPhrases).mockResolvedValue([]);
      await readTts("", { voiceName: "test" });
      expect(utils.speak).not.toHaveBeenCalled();
    });
  });

  describe("refreshTts", () => {
    it("should call refresh from utils", async () => {
      await refreshTts();
      expect(utils.refresh).toHaveBeenCalled();
    });
  });

  describe("stopTts", () => {
    it("should call stop from utils and sendFinishedSpeaking", async () => {
      await stopTts();
      expect(utils.stop).toHaveBeenCalled();
      expect(utils.messageToContentScript).toHaveBeenCalledWith(
        message.sendFinishedSpeaking,
        {},
      );
    });
  });

  describe("onTtsEvent", () => {
    it("should call onTts and catch errors", async () => {
      const err = new Error("stop failed");
      vi.mocked(utils.stop).mockRejectedValue(err); // Make utils.stop reject

      const mockEvent: chrome.tts.TtsEvent = {
        type: "error",
        errorMessage: "some error",
      }; // Trigger onError
      onTtsEvent(mockEvent); // This will call onTts, which calls onError, which calls utils.stop

      await flushPromises(); // Allow promises to settle

      expect(logErrorSpy).toHaveBeenCalledWith(err);
    });

    it("should handle 'start' event", async () => {
      const mockEvent: chrome.tts.TtsEvent = { type: "start" };
      onTtsEvent(mockEvent);
      await flushPromises();
      expect(utils.messageToContentScript).toHaveBeenCalledWith(
        message.sendStartedSpeaking,
        {},
      );
    });

    it("should handle 'interrupted' event", async () => {
      const mockEvent: chrome.tts.TtsEvent = { type: "interrupted" };
      onTtsEvent(mockEvent);
      await flushPromises();
      expect(utils.messageToContentScript).toHaveBeenCalledWith(
        message.sendFinishedSpeaking,
        {},
      );
    });

    it("should handle 'end' event", async () => {
      const mockEvent: chrome.tts.TtsEvent = { type: "end" };
      onTtsEvent(mockEvent);
      await flushPromises();
      expect(utils.messageToContentScript).toHaveBeenCalledWith(
        message.sendEndedSpeaking,
        {},
      );
    });

    it("should handle 'error' event", async () => {
      const errorMessage = "TTS failed";
      const mockEvent: chrome.tts.TtsEvent = {
        type: "error",
        errorMessage: errorMessage,
      };
      onTtsEvent(mockEvent);
      await flushPromises();
      expect(utils.stop).toHaveBeenCalled(); // Called by stopTts
      expect(utils.messageToContentScript).toHaveBeenCalledWith(
        message.sendFinishedSpeaking,
        {},
      ); // Called by stopTts
      expect(logErrorSpy).toHaveBeenCalledWith(`Error: ${errorMessage}`); // Called by error
    });

    it("should handle 'error' event with undefined errorMessage", async () => {
      const mockEvent: chrome.tts.TtsEvent = { type: "error" };
      onTtsEvent(mockEvent);
      await flushPromises();
      expect(utils.stop).toHaveBeenCalled(); // Called by stopTts
      expect(utils.messageToContentScript).toHaveBeenCalledWith(
        message.sendFinishedSpeaking,
        {},
      ); // Called by stopTts
      expect(logErrorSpy).toHaveBeenCalledWith(`Error: undefined`);
    });

    it("should handle unknown event types gracefully", async () => {
      const mockEvent = { type: "unknown" } as unknown as chrome.tts.TtsEvent;
      onTtsEvent(mockEvent);
      await flushPromises();
      // Should not call any message handlers for unknown event types
      expect(utils.messageToContentScript).not.toHaveBeenCalled();
      expect(utils.stop).not.toHaveBeenCalled();
      expect(logErrorSpy).not.toHaveBeenCalled();
    });

    it("should handle 'pause' event type gracefully", async () => {
      const mockEvent: chrome.tts.TtsEvent = { type: "pause" };
      onTtsEvent(mockEvent);
      await flushPromises();
      // Should not call any message handlers for pause event
      expect(utils.messageToContentScript).not.toHaveBeenCalled();
      expect(utils.stop).not.toHaveBeenCalled();
      expect(logErrorSpy).not.toHaveBeenCalled();
    });

    it("should handle 'resume' event type gracefully", async () => {
      const mockEvent: chrome.tts.TtsEvent = { type: "resume" };
      onTtsEvent(mockEvent);
      await flushPromises();
      // Should not call any message handlers for resume event
      expect(utils.messageToContentScript).not.toHaveBeenCalled();
      expect(utils.stop).not.toHaveBeenCalled();
      expect(logErrorSpy).not.toHaveBeenCalled();
    });
  });
});
