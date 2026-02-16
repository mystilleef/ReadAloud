/// <reference types="vitest/globals" />

import { storage as chromeStorage } from "@extend-chrome/storage";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PITCH, RATE, VOICENAME } from "../constants";
import * as storage from "../storage";

vi.mock("@extend-chrome/storage", () => {
  return {
    storage: {
      sync: {
        get: vi.fn(),
        set: vi.fn(() => Promise.resolve({})),
        clear: vi.fn(() => Promise.resolve()),
      },
    },
  };
});

const DEFAULT_RATE = 1;
const DEFAULT_VOICENAME = "Google US English";
const DEFAULT_PITCH = 1;

describe("storage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getVoiceName", () => {
    it("should return voice name from sync storage if it exists", async () => {
      const mockStorage = { [VOICENAME]: "Test Voice" };
      vi.mocked(chromeStorage.sync.get).mockResolvedValue(mockStorage);

      const voiceName = await storage.getVoiceName();

      expect(voiceName).toEqual("Test Voice");
      expect(chromeStorage.sync.get).toHaveBeenCalledWith(VOICENAME);
    });

    it("should return default voice name if sync storage is empty", async () => {
      vi.mocked(chromeStorage.sync.get).mockResolvedValue({});
      const voiceName = await storage.getVoiceName();
      expect(voiceName).toEqual(DEFAULT_VOICENAME);
    });
  });

  describe("getRate", () => {
    it("should return rate from sync storage if it exists", async () => {
      const mockStorage = { [RATE]: 1.5 };
      vi.mocked(chromeStorage.sync.get).mockResolvedValue(mockStorage);

      const rate = await storage.getRate();

      expect(rate).toEqual(1.5);
      expect(chromeStorage.sync.get).toHaveBeenCalledWith(RATE);
    });

    it("should return default rate if sync storage is empty", async () => {
      vi.mocked(chromeStorage.sync.get).mockResolvedValue({});
      const rate = await storage.getRate();
      expect(rate).toEqual(DEFAULT_RATE);
    });

    it("should return default rate if stored rate is 0", async () => {
      const mockStorage = { [RATE]: 0 };
      vi.mocked(chromeStorage.sync.get).mockResolvedValue(mockStorage);
      const rate = await storage.getRate();
      expect(rate).toEqual(DEFAULT_RATE);
    });
  });

  describe("getPitch", () => {
    it("should return pitch from sync storage if it exists", async () => {
      const mockStorage = { [PITCH]: 1.2 };
      vi.mocked(chromeStorage.sync.get).mockResolvedValue(mockStorage);

      const pitch = await storage.getPitch();

      expect(pitch).toEqual(1.2);
      expect(chromeStorage.sync.get).toHaveBeenCalledWith(PITCH);
    });

    it("should return default pitch if sync storage is empty", async () => {
      vi.mocked(chromeStorage.sync.get).mockResolvedValue({});
      const pitch = await storage.getPitch();
      expect(pitch).toEqual(DEFAULT_PITCH);
    });

    it("should return default pitch if stored pitch is 0", async () => {
      const mockStorage = { [PITCH]: 0 };
      vi.mocked(chromeStorage.sync.get).mockResolvedValue(mockStorage);
      const pitch = await storage.getPitch();
      expect(pitch).toEqual(DEFAULT_PITCH);
    });
  });

  describe("getStorageOptions", () => {
    it("should return all options from storage", async () => {
      vi.mocked(chromeStorage.sync.get).mockImplementation(
        async (key: string | string[] | Record<string, unknown> | null) => {
          if (key === RATE) return { [RATE]: 1.5 };
          if (key === VOICENAME) return { [VOICENAME]: "Test Voice" };
          if (key === PITCH) return { [PITCH]: 1.2 };
          return {};
        },
      );

      const options = await storage.getStorageOptions();

      expect(options).toEqual({
        rate: 1.5,
        voiceName: "Test Voice",
        pitch: 1.2,
      });
    });
  });

  describe("storeDefaultOptions", () => {
    it("should clear sync storage and set default options", async () => {
      vi.mocked(chromeStorage.sync.clear).mockResolvedValue(undefined);
      vi.mocked(chromeStorage.sync.set).mockResolvedValue({});

      await storage.storeDefaultOptions();

      expect(chromeStorage.sync.clear).toHaveBeenCalled();
      expect(chromeStorage.sync.set).toHaveBeenCalledWith({
        rate: DEFAULT_RATE,
        voiceName: DEFAULT_VOICENAME,
        pitch: DEFAULT_PITCH,
      });
    });
  });

  describe("storeVoice", () => {
    it("should store the voice name", async () => {
      vi.mocked(chromeStorage.sync.set).mockResolvedValue({});
      await storage.storeVoice("New Voice");
      expect(chromeStorage.sync.set).toHaveBeenCalledWith({
        voiceName: "New Voice",
      });
    });
  });

  describe("storeRate", () => {
    it("should store the rate", async () => {
      vi.mocked(chromeStorage.sync.set).mockResolvedValue({});
      await storage.storeRate(2.0);
      expect(chromeStorage.sync.set).toHaveBeenCalledWith({ rate: 2.0 });
    });
  });

  describe("storePitch", () => {
    it("should store the pitch", async () => {
      vi.mocked(chromeStorage.sync.set).mockResolvedValue({});
      await storage.storePitch(0.8);
      expect(chromeStorage.sync.set).toHaveBeenCalledWith({ pitch: 0.8 });
    });
  });

  describe("getSpeakOptions", () => {
    it("should return speak options with values from storage", async () => {
      vi.mocked(chromeStorage.sync.get).mockImplementation(
        async (key: string | string[] | Record<string, unknown> | null) => {
          if (key === RATE) return { [RATE]: 1.5 };
          if (key === VOICENAME) return { [VOICENAME]: "Test Voice" };
          if (key === PITCH) return { [PITCH]: 1.2 };
          return {};
        },
      );

      const speakOptions = await storage.getSpeakOptions();

      expect(speakOptions).toEqual({
        enqueue: true,
        rate: 1.5,
        pitch: 1.2,
        voiceName: "Test Voice",
        volume: 1,
      });
    });
  });
});
