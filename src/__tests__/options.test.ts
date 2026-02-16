/// <reference types="vitest/globals" />

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock storage functions
const mockGetPitch = vi.fn();
const mockGetRate = vi.fn();
const mockGetVoiceName = vi.fn();
const mockStoreDefaultOptions = vi.fn();
const mockStorePitch = vi.fn();
const mockStoreRate = vi.fn();
const mockStoreVoice = vi.fn();

vi.mock("../storage", () => ({
  getPitch: mockGetPitch,
  getRate: mockGetRate,
  getVoiceName: mockGetVoiceName,
  storeDefaultOptions: mockStoreDefaultOptions,
  storePitch: mockStorePitch,
  storeRate: mockStoreRate,
  storeVoice: mockStoreVoice,
}));

// Mock utils functions
const mockGetTtsVoices = vi.fn();

vi.mock("../utils", () => ({
  getTtsVoices: mockGetTtsVoices,
}));

// Type for chrome storage listener
type StorageChangeListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string,
) => void;

// Mock chrome.storage.onChanged
const mockOnChangedListeners: StorageChangeListener[] = [];
global.chrome = {
  storage: {
    onChanged: {
      addListener: vi.fn((listener: StorageChangeListener) =>
        mockOnChangedListeners.push(listener),
      ),
      removeListener: vi.fn(),
      hasListener: vi.fn(),
    },
  },
} as unknown as typeof chrome;

// Mock DOM element types
interface MockInputElement {
  value: string;
  addEventListener: ReturnType<typeof vi.fn>;
}

interface MockSpanElement {
  textContent: string;
}

interface MockSelectElement {
  value: string;
  innerHTML: string;
  addEventListener: ReturnType<typeof vi.fn>;
  appendChild: ReturnType<typeof vi.fn>;
}

interface MockButtonElement {
  addEventListener: ReturnType<typeof vi.fn>;
}

// Mock DOM elements
const mockRateEl: MockInputElement = {
  value: "1",
  addEventListener: vi.fn(),
};
const mockRateValueEl: MockSpanElement = { textContent: "" };
const mockPitchEl: MockInputElement = {
  value: "1",
  addEventListener: vi.fn(),
};
const mockPitchValueEl: MockSpanElement = { textContent: "" };
const mockVoiceEl: MockSelectElement = {
  value: "",
  innerHTML: "",
  addEventListener: vi.fn(),
  appendChild: vi.fn(),
};
const mockResetEl: MockButtonElement = { addEventListener: vi.fn() };

// Mock document.getElementById
const originalGetElementById = document.getElementById;
document.getElementById = vi.fn((id) => {
  switch (id) {
    case "rate":
      return mockRateEl as unknown as HTMLElement;
    case "rate-value":
      return mockRateValueEl as unknown as HTMLElement;
    case "pitch":
      return mockPitchEl as unknown as HTMLElement;
    case "pitch-value":
      return mockPitchValueEl as unknown as HTMLElement;
    case "voice":
      return mockVoiceEl as unknown as HTMLElement;
    case "reset":
      return mockResetEl as unknown as HTMLElement;
    default:
      return originalGetElementById.call(document, id);
  }
}) as typeof document.getElementById;

// Mock document.addEventListener to track DOMContentLoaded listeners
type DocumentEventListener = (event: Event) => void;
const documentListeners: Map<string, DocumentEventListener[]> = new Map();
const originalAddEventListener = document.addEventListener;

document.addEventListener = vi.fn(
  (event: string, callback: DocumentEventListener) => {
    if (!documentListeners.has(event)) {
      documentListeners.set(event, []);
    }
    documentListeners.get(event)?.push(callback);
    originalAddEventListener.call(document, event, callback);
  },
) as typeof document.addEventListener;

// Mock HTMLOptionElement
class MockHTMLOptionElement {
  value = "";
  textContent = "";
  selected = false;
}
global.HTMLOptionElement =
  MockHTMLOptionElement as unknown as typeof HTMLOptionElement;

// Mock document.createElement
const originalCreateElement = document.createElement;
document.createElement = vi.fn((tagName: string) => {
  if (tagName === "option") {
    return new MockHTMLOptionElement() as unknown as HTMLElement;
  }
  return originalCreateElement.call(document, tagName);
}) as typeof document.createElement;

describe("Options Module", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockOnChangedListeners.length = 0;
    documentListeners.clear();

    // Reset mock DOM element states
    mockRateEl.value = "1";
    mockRateValueEl.textContent = "";
    mockPitchEl.value = "1";
    mockPitchValueEl.textContent = "";
    mockVoiceEl.value = "";
    mockVoiceEl.innerHTML = "";

    // Mock storage return values
    mockGetRate.mockResolvedValue(1.5);
    mockGetPitch.mockResolvedValue(0.8);
    mockGetVoiceName.mockResolvedValue("Google US English");
    mockGetTtsVoices.mockResolvedValue([
      { voiceName: "Google US English", lang: "en-US" },
      { voiceName: "Google UK English", lang: "en-GB" },
      { voiceName: "Google UK English Female", lang: "en-GB" },
    ]);
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("Initialization", () => {
    it("should initialize rate slider with stored value", async () => {
      // Import to trigger initialization
      await import("../options");

      // Trigger DOMContentLoaded
      const domLoadedListeners =
        documentListeners.get("DOMContentLoaded") || [];
      for (const listener of domLoadedListeners) {
        await listener(new Event("DOMContentLoaded"));
      }

      // Wait for async initialization
      await vi.waitFor(() => {
        expect(mockGetRate).toHaveBeenCalled();
      });

      expect(mockRateEl.value).toBe("1.5");
      expect(mockRateValueEl.textContent).toBe("1.5");
    });

    it("should initialize pitch slider with stored value", async () => {
      await import("../options");

      const domLoadedListeners =
        documentListeners.get("DOMContentLoaded") || [];
      for (const listener of domLoadedListeners) {
        await listener(new Event("DOMContentLoaded"));
      }

      await vi.waitFor(() => {
        expect(mockGetPitch).toHaveBeenCalled();
      });

      expect(mockPitchEl.value).toBe("0.8");
      expect(mockPitchValueEl.textContent).toBe("0.8");
    });

    it("should populate voice select with available voices", async () => {
      await import("../options");

      const domLoadedListeners =
        documentListeners.get("DOMContentLoaded") || [];
      for (const listener of domLoadedListeners) {
        await listener(new Event("DOMContentLoaded"));
      }

      await vi.waitFor(() => {
        expect(mockGetTtsVoices).toHaveBeenCalled();
      });

      // Verify innerHTML was cleared
      expect(mockVoiceEl.innerHTML).toBe("");

      // Verify all voices were added
      expect(mockVoiceEl.appendChild).toHaveBeenCalledTimes(3);

      // Check that the current voice is selected
      const appendCalls = mockVoiceEl.appendChild.mock.calls;
      const selectedVoice = appendCalls.find(
        ([option]) =>
          (option as unknown as MockHTMLOptionElement).selected === true &&
          (option as unknown as MockHTMLOptionElement).value ===
            "Google US English",
      );
      expect(selectedVoice).toBeDefined();
    });

    it("should handle voices with null voiceName", async () => {
      mockGetTtsVoices.mockResolvedValue([
        { voiceName: "Google US English", lang: "en-US" },
        { voiceName: null, lang: "en-GB" },
      ]);

      await import("../options");

      const domLoadedListeners =
        documentListeners.get("DOMContentLoaded") || [];
      for (const listener of domLoadedListeners) {
        await listener(new Event("DOMContentLoaded"));
      }

      await vi.waitFor(() => {
        expect(mockVoiceEl.appendChild).toHaveBeenCalled();
      });

      // Check that the null voice was handled (value set to empty string)
      const appendCalls = mockVoiceEl.appendChild.mock.calls;
      const nullVoice = appendCalls.find(
        ([option]) => (option as unknown as MockHTMLOptionElement).value === "",
      );
      expect(nullVoice).toBeDefined();
    });

    it("should handle empty voices array", async () => {
      mockGetTtsVoices.mockResolvedValue([]);

      await import("../options");

      const domLoadedListeners =
        documentListeners.get("DOMContentLoaded") || [];
      for (const listener of domLoadedListeners) {
        await listener(new Event("DOMContentLoaded"));
      }

      await vi.waitFor(() => {
        expect(mockGetTtsVoices).toHaveBeenCalled();
      });

      expect(mockVoiceEl.innerHTML).toBe("");
      expect(mockVoiceEl.appendChild).not.toHaveBeenCalled();
    });
  });

  describe("Event Listeners", () => {
    it("should register input listener on rate slider", async () => {
      await import("../options");

      expect(mockRateEl.addEventListener).toHaveBeenCalledWith(
        "input",
        expect.any(Function),
      );
    });

    it("should register input listener on pitch slider", async () => {
      await import("../options");

      expect(mockPitchEl.addEventListener).toHaveBeenCalledWith(
        "input",
        expect.any(Function),
      );
    });

    it("should register change listener on voice select", async () => {
      await import("../options");

      expect(mockVoiceEl.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
    });

    it("should register click listener on reset button", async () => {
      await import("../options");

      expect(mockResetEl.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
      );
    });

    it("should register chrome storage change listener", async () => {
      await import("../options");

      expect(chrome.storage.onChanged.addListener).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(mockOnChangedListeners.length).toBe(1);
    });
  });

  describe("Rate Change", () => {
    it("should update rate value display when slider changes", async () => {
      await import("../options");

      const rateChangeListener = mockRateEl.addEventListener.mock.calls.find(
        ([event]) => event === "input",
      )?.[1];

      expect(rateChangeListener).toBeDefined();

      mockRateEl.value = "1.7";
      rateChangeListener();

      expect(mockRateValueEl.textContent).toBe("1.7");
    });

    it("should store new rate when slider changes", async () => {
      await import("../options");

      const rateChangeListener = mockRateEl.addEventListener.mock.calls.find(
        ([event]) => event === "input",
      )?.[1];

      mockRateEl.value = "2.0";
      rateChangeListener();

      expect(mockStoreRate).toHaveBeenCalledWith(2.0);
    });

    it("should handle decimal rate values", async () => {
      await import("../options");

      const rateChangeListener = mockRateEl.addEventListener.mock.calls.find(
        ([event]) => event === "input",
      )?.[1];

      mockRateEl.value = "1.15";
      rateChangeListener();

      expect(mockRateValueEl.textContent).toBe("1.15");
      expect(mockStoreRate).toHaveBeenCalledWith(1.15);
    });

    it("should handle minimum rate value", async () => {
      await import("../options");

      const rateChangeListener = mockRateEl.addEventListener.mock.calls.find(
        ([event]) => event === "input",
      )?.[1];

      mockRateEl.value = "0.1";
      rateChangeListener();

      expect(mockRateValueEl.textContent).toBe("0.1");
      expect(mockStoreRate).toHaveBeenCalledWith(0.1);
    });

    it("should handle maximum rate value", async () => {
      await import("../options");

      const rateChangeListener = mockRateEl.addEventListener.mock.calls.find(
        ([event]) => event === "input",
      )?.[1];

      mockRateEl.value = "2";
      rateChangeListener();

      expect(mockRateValueEl.textContent).toBe("2");
      expect(mockStoreRate).toHaveBeenCalledWith(2);
    });
  });

  describe("Pitch Change", () => {
    it("should update pitch value display when slider changes", async () => {
      await import("../options");

      const pitchChangeListener = mockPitchEl.addEventListener.mock.calls.find(
        ([event]) => event === "input",
      )?.[1];

      expect(pitchChangeListener).toBeDefined();

      mockPitchEl.value = "1.2";
      pitchChangeListener();

      expect(mockPitchValueEl.textContent).toBe("1.2");
    });

    it("should store new pitch when slider changes", async () => {
      await import("../options");

      const pitchChangeListener = mockPitchEl.addEventListener.mock.calls.find(
        ([event]) => event === "input",
      )?.[1];

      mockPitchEl.value = "0.9";
      pitchChangeListener();

      expect(mockStorePitch).toHaveBeenCalledWith(0.9);
    });

    it("should handle decimal pitch values", async () => {
      await import("../options");

      const pitchChangeListener = mockPitchEl.addEventListener.mock.calls.find(
        ([event]) => event === "input",
      )?.[1];

      mockPitchEl.value = "1.35";
      pitchChangeListener();

      expect(mockPitchValueEl.textContent).toBe("1.35");
      expect(mockStorePitch).toHaveBeenCalledWith(1.35);
    });

    it("should handle minimum pitch value", async () => {
      await import("../options");

      const pitchChangeListener = mockPitchEl.addEventListener.mock.calls.find(
        ([event]) => event === "input",
      )?.[1];

      mockPitchEl.value = "0.1";
      pitchChangeListener();

      expect(mockPitchValueEl.textContent).toBe("0.1");
      expect(mockStorePitch).toHaveBeenCalledWith(0.1);
    });

    it("should handle maximum pitch value", async () => {
      await import("../options");

      const pitchChangeListener = mockPitchEl.addEventListener.mock.calls.find(
        ([event]) => event === "input",
      )?.[1];

      mockPitchEl.value = "2";
      pitchChangeListener();

      expect(mockPitchValueEl.textContent).toBe("2");
      expect(mockStorePitch).toHaveBeenCalledWith(2);
    });
  });

  describe("Voice Change", () => {
    it("should store new voice when select changes", async () => {
      await import("../options");

      const voiceChangeListener = mockVoiceEl.addEventListener.mock.calls.find(
        ([event]) => event === "change",
      )?.[1];

      expect(voiceChangeListener).toBeDefined();

      mockVoiceEl.value = "Google UK English";
      voiceChangeListener();

      expect(mockStoreVoice).toHaveBeenCalledWith("Google UK English");
    });

    it("should handle voice change with empty value", async () => {
      await import("../options");

      const voiceChangeListener = mockVoiceEl.addEventListener.mock.calls.find(
        ([event]) => event === "change",
      )?.[1];

      mockVoiceEl.value = "";
      voiceChangeListener();

      expect(mockStoreVoice).toHaveBeenCalledWith("");
    });

    it("should handle voice change with special characters", async () => {
      await import("../options");

      const voiceChangeListener = mockVoiceEl.addEventListener.mock.calls.find(
        ([event]) => event === "change",
      )?.[1];

      mockVoiceEl.value = "Google UK English Female";
      voiceChangeListener();

      expect(mockStoreVoice).toHaveBeenCalledWith("Google UK English Female");
    });
  });

  describe("Reset Button", () => {
    it("should call storeDefaultOptions when reset button is clicked", async () => {
      mockStoreDefaultOptions.mockResolvedValue(undefined);

      await import("../options");

      const resetClickListener = mockResetEl.addEventListener.mock.calls.find(
        ([event]) => event === "click",
      )?.[1];

      expect(resetClickListener).toBeDefined();

      await resetClickListener();

      expect(mockStoreDefaultOptions).toHaveBeenCalled();
    });

    it("should re-initialize UI after reset", async () => {
      mockStoreDefaultOptions.mockResolvedValue(undefined);

      // Set new default values
      mockGetRate.mockResolvedValue(1.0);
      mockGetPitch.mockResolvedValue(1.0);
      mockGetVoiceName.mockResolvedValue("Google US English");

      await import("../options");

      const resetClickListener = mockResetEl.addEventListener.mock.calls.find(
        ([event]) => event === "click",
      )?.[1];

      const initialGetRateCalls = mockGetRate.mock.calls.length;

      await resetClickListener();

      // Wait for re-initialization
      await vi.waitFor(() => {
        expect(mockGetRate).toHaveBeenCalledTimes(initialGetRateCalls + 1);
      });

      expect(mockGetPitch).toHaveBeenCalled();
      expect(mockGetVoiceName).toHaveBeenCalled();
      expect(mockGetTtsVoices).toHaveBeenCalled();
    });
  });

  describe("Storage Change Listener", () => {
    it("should re-initialize UI when storage changes", async () => {
      await import("../options");

      expect(mockOnChangedListeners.length).toBe(1);

      const storageChangeListener = mockOnChangedListeners[0];

      if (storageChangeListener) {
        // Clear mocks to get fresh counts
        vi.clearAllMocks();
        mockGetRate.mockResolvedValue(2.0);
        mockGetPitch.mockResolvedValue(1.1);
        mockGetVoiceName.mockResolvedValue("Google UK English");
        mockGetTtsVoices.mockResolvedValue([
          { voiceName: "Google US English", lang: "en-US" },
          { voiceName: "Google UK English", lang: "en-GB" },
        ]);

        // Trigger storage change
        storageChangeListener({}, "sync");

        // Wait for re-initialization - verify all storage functions are called
        await vi.waitFor(() => {
          expect(mockGetRate).toHaveBeenCalled();
          expect(mockGetPitch).toHaveBeenCalled();
          expect(mockGetVoiceName).toHaveBeenCalled();
          expect(mockGetTtsVoices).toHaveBeenCalled();
        });
      }
    });

    it("should handle storage changes with different area names", async () => {
      await import("../options");

      const storageChangeListener = mockOnChangedListeners[0];

      if (storageChangeListener) {
        // Clear mocks to get fresh counts
        vi.clearAllMocks();
        mockGetRate.mockResolvedValue(1.5);
        mockGetPitch.mockResolvedValue(0.8);
        mockGetVoiceName.mockResolvedValue("Google US English");
        mockGetTtsVoices.mockResolvedValue([
          { voiceName: "Google US English", lang: "en-US" },
        ]);

        // Trigger storage change with local area
        storageChangeListener({}, "local");

        await vi.waitFor(() => {
          expect(mockGetRate).toHaveBeenCalled();
        });
      }
    });

    it("should handle storage changes with change data", async () => {
      await import("../options");

      const storageChangeListener = mockOnChangedListeners[0];

      if (storageChangeListener) {
        // Clear mocks to get fresh counts
        vi.clearAllMocks();
        mockGetRate.mockResolvedValue(1.5);
        mockGetPitch.mockResolvedValue(0.8);
        mockGetVoiceName.mockResolvedValue("Google US English");
        mockGetTtsVoices.mockResolvedValue([
          { voiceName: "Google US English", lang: "en-US" },
        ]);

        // Trigger storage change with actual changes
        storageChangeListener(
          {
            rate: { oldValue: 1.0, newValue: 1.5 },
          },
          "sync",
        );

        await vi.waitFor(() => {
          expect(mockGetRate).toHaveBeenCalled();
        });
      }
    });
  });
});
