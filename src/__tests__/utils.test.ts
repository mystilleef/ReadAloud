import { beforeEach, describe, expect, it, vi } from "vitest";
import { logChromeErrorMessage, logError } from "../error";
import {
  getTtsVoices,
  isSpeaking,
  messageToContentScript,
  pause,
  refresh,
  resume,
  speak,
  splitPhrases,
  stop,
} from "../utils";

vi.mock("../error", () => ({
  logError: vi.fn(),
  logChromeErrorMessage: vi.fn(),
}));

const getVoicesMock = vi.fn<
  (callback?: (voices: chrome.tts.TtsVoice[]) => void) => void
>((callback?: (voices: chrome.tts.TtsVoice[]) => void) => {
  callback?.([]);
});

const isSpeakingMock = vi.fn<(callback: (speaking: boolean) => void) => void>(
  (callback: (speaking: boolean) => void) => {
    callback(false);
  },
);

const speakMock = vi.fn<
  (
    utterance: string,
    options?: chrome.tts.TtsOptions,
    callback?: () => void,
  ) => void
>(
  (
    _utterance: string,
    _options?: chrome.tts.TtsOptions,
    callback?: () => void,
  ) => {
    callback?.();
  },
);

const resumeMock = vi.fn<() => void>(() => {});
const stopMock = vi.fn<() => void>(() => {});
const pauseMock = vi.fn<() => void>(() => {});

const tabsQueryMock = vi.fn<
  (
    queryInfo: chrome.tabs.QueryInfo,
    callback: (tabs: chrome.tabs.Tab[]) => void,
  ) => void
>(
  (
    _queryInfo: chrome.tabs.QueryInfo,
    callback: (tabs: chrome.tabs.Tab[]) => void,
  ) => {
    callback([{ id: 1 } as chrome.tabs.Tab]);
  },
);

const runtimeMock: Partial<typeof chrome.runtime> & {
  lastError: chrome.runtime.LastError | undefined;
} = {
  lastError: undefined,
};

describe("utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getVoicesMock.mockImplementation(
      (callback?: (voices: chrome.tts.TtsVoice[]) => void) => {
        callback?.([]);
      },
    );
    isSpeakingMock.mockImplementation(
      (callback: (speaking: boolean) => void) => {
        callback(false);
      },
    );
    speakMock.mockImplementation(
      (
        _text: string,
        _options?: chrome.tts.TtsOptions,
        callback?: () => void,
      ) => {
        callback?.();
      },
    );
    tabsQueryMock.mockImplementation(
      (
        _queryInfo: chrome.tabs.QueryInfo,
        callback: (tabs: chrome.tabs.Tab[]) => void,
      ) => {
        callback([{ id: 1 } as chrome.tabs.Tab]);
      },
    );
    runtimeMock.lastError = undefined;
    global.chrome = {
      tts: {
        getVoices: getVoicesMock,
        isSpeaking: isSpeakingMock,
        speak: speakMock,
        resume: resumeMock,
        stop: stopMock,
        pause: pauseMock,
      },
      tabs: {
        query: tabsQueryMock,
      },
      runtime: runtimeMock as typeof chrome.runtime,
    } as unknown as typeof chrome;
  });

  describe("getTtsVoices", () => {
    it("should resolve with an array of TtsVoice", async () => {
      const mockVoices = [{ voiceName: "test" }] as chrome.tts.TtsVoice[];
      getVoicesMock.mockImplementation(
        (callback?: (voices: chrome.tts.TtsVoice[]) => void) => {
          callback?.(mockVoices);
        },
      );
      const voices = await getTtsVoices();
      expect(voices).toEqual(mockVoices);
    });
  });

  describe("isSpeaking", () => {
    it("should resolve with a boolean", async () => {
      isSpeakingMock.mockImplementation(
        (callback: (speaking: boolean) => void) => {
          callback(true);
        },
      );
      const speaking = await isSpeaking();
      expect(speaking).toBe(true);
    });
  });

  describe("speak", () => {
    it("should call chrome.tts.speak", async () => {
      const phrase = "hello";
      const options = { voiceName: "test" };
      await speak(phrase, options);
      expect(chrome.tts.speak).toHaveBeenCalledWith(
        phrase,
        options,
        expect.any(Function),
      );
    });

    it("should call logChromeErrorMessage on callback", async () => {
      await speak("hello", {});
      expect(logChromeErrorMessage).toHaveBeenCalled();
    });
  });

  describe("resume", () => {
    it("should call chrome.tts.resume", async () => {
      await resume();
      expect(chrome.tts.resume).toHaveBeenCalled();
    });
  });

  describe("stop", () => {
    it("should call chrome.tts.stop", async () => {
      await stop();
      expect(chrome.tts.stop).toHaveBeenCalled();
    });
  });

  describe("pause", () => {
    it("should call chrome.tts.pause", async () => {
      await pause();
      expect(chrome.tts.pause).toHaveBeenCalled();
    });
  });

  describe("refresh", () => {
    it("should call chrome.tts.pause and chrome.tts.resume", async () => {
      await refresh();
      expect(chrome.tts.pause).toHaveBeenCalled();
      expect(chrome.tts.resume).toHaveBeenCalled();
    });
  });

  describe("messageToContentScript", () => {
    it("should call the function with the tab id", async () => {
      const func = vi.fn().mockResolvedValue(undefined);
      const data = { data: "test" };
      await messageToContentScript(func, data);
      expect(chrome.tabs.query).toHaveBeenCalled();
      expect(func).toHaveBeenCalledWith(data, { tabId: 1 });
    });

    it("should not call the function if no tab is found", async () => {
      tabsQueryMock.mockImplementation(
        (
          _queryInfo: chrome.tabs.QueryInfo,
          callback: (tabs: chrome.tabs.Tab[]) => void,
        ) => {
          callback([]);
        },
      );
      const func = vi.fn();
      const data = { data: "test" };
      await messageToContentScript(func, data);
      expect(func).not.toHaveBeenCalled();
    });

    it("should log an error if the function throws", async () => {
      const error = new Error("test error");
      const func = vi.fn().mockRejectedValue(error);
      const data = { data: "test" };
      await messageToContentScript(func, data);
      expect(logError).toHaveBeenCalledWith(error);
    });
  });

  describe("splitPhrases", () => {
    it("should split text into phrases under chunk size", async () => {
      const text = "This is a test. This is another test.";
      const result = await splitPhrases(text);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      for (const phrase of result) {
        expect(phrase.length).toBeLessThanOrEqual(640);
      }
    });

    it("should compress multiple whitespaces into single space", async () => {
      const text = "This  has   multiple    spaces";
      const result = await splitPhrases(text);
      expect(result[0]).toBe("This has multiple spaces");
    });

    it("should trim the text", async () => {
      const text = "  trimmed text  ";
      const result = await splitPhrases(text);
      expect(result[0]).toBe("trimmed text");
    });

    it("should handle empty strings", async () => {
      const result = await splitPhrases("");
      expect(result).toEqual([]);
    });

    it("should handle long text exceeding chunk size", async () => {
      // Create text with spaces to allow splitting
      const longText = Array(10).fill("a".repeat(100)).join(" ");
      const result = await splitPhrases(longText);
      expect(result.length).toBeGreaterThan(1);
      // Each chunk should be under or equal to 640 chars
      for (const phrase of result) {
        expect(phrase.length).toBeLessThanOrEqual(640);
      }
    });

    it("should preserve non-breaking chunks", async () => {
      const text = "word1 word2 word3";
      const result = await splitPhrases(text);
      expect(result.join(" ")).toBe(text);
    });
  });
});
