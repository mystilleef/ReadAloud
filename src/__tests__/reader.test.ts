/// <reference types="vitest/globals" />

import { beforeEach, describe, expect, it, vi } from "vitest";
import { readPhrases, refresh, stop } from "../reader";
import { onTtsEvent, refreshTts, stopTts } from "../ttshandler";
import { speak } from "../utils";

vi.mock("../utils");
vi.mock("../ttshandler");

describe("reader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (speak as vi.Mock).mockResolvedValue(undefined);
  });

  describe("readPhrases", () => {
    it("should call speak for each phrase", async () => {
      const phrases = ["hello", "world"];
      const options = { voiceName: "test" };
      await readPhrases(phrases, options);
      expect(speak).toHaveBeenCalledTimes(2);
      expect(speak).toHaveBeenCalledWith("hello", {
        ...options,
        onEvent: onTtsEvent,
      });
      expect(speak).toHaveBeenCalledWith("world", {
        ...options,
        onEvent: onTtsEvent,
      });
    });

    it("should not call speak for an empty array of phrases", async () => {
      await readPhrases([], { voiceName: "test" });
      expect(speak).not.toHaveBeenCalled();
    });

    it("should handle a single phrase", async () => {
      const phrases = ["single phrase"];
      const options = { lang: "en-US" };
      await readPhrases(phrases, options);
      expect(speak).toHaveBeenCalledTimes(1);
      expect(speak).toHaveBeenCalledWith("single phrase", {
        ...options,
        onEvent: onTtsEvent,
      });
    });
  });

  describe("stop", () => {
    it("should call stopTts", () => {
      stop();
      expect(stopTts).toHaveBeenCalled();
    });
  });

  describe("refresh", () => {
    it("should call refreshTts", () => {
      refresh();
      expect(refreshTts).toHaveBeenCalled();
    });
  });
});
