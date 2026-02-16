/// <reference types="vitest/globals" />

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import updateBrowserIcon from "../icon";

// Mock chrome.action API
const mockSetBadgeText = vi.fn();
const mockSetIcon = vi.fn();

global.chrome = {
  action: {
    setBadgeText: mockSetBadgeText,
    setIcon: mockSetIcon,
  },
} as unknown as typeof chrome;

// Mock icon module
vi.mock("../icon", () => ({
  default: vi.fn(),
}));

describe("badgeCounter", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockSetBadgeText.mockResolvedValue(undefined);
    vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

    // Reset the counter module state by re-importing
    // This is necessary because badgeCounter is a singleton
    vi.resetModules();
    const { default: freshCounter } = await import("../counter");
    await freshCounter.reset();
    vi.clearAllMocks(); // Clear mocks after reset
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("increment", () => {
    it("should increment the counter and update badge text", async () => {
      const { default: freshCounter } = await import("../counter");
      await freshCounter.increment(5);

      expect(mockSetBadgeText).toHaveBeenCalledWith({ text: "5" });
      expect(updateBrowserIcon).toHaveBeenCalled();
    });

    it("should accumulate increments", async () => {
      const { default: freshCounter } = await import("../counter");
      await freshCounter.increment(2);
      await freshCounter.increment(3);

      expect(mockSetBadgeText).toHaveBeenCalledTimes(2);
      expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "5" });
    });

    it("should handle incrementing by 1 by default", async () => {
      const { default: freshCounter } = await import("../counter");
      await freshCounter.increment();

      expect(mockSetBadgeText).toHaveBeenCalledWith({ text: "1" });
    });
  });

  describe("decrement", () => {
    it("should decrement the counter and update badge text", async () => {
      const { default: freshCounter } = await import("../counter");
      await freshCounter.increment(10);
      await freshCounter.decrement();

      expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "9" });
    });

    it("should not decrement below zero", async () => {
      const { default: freshCounter } = await import("../counter");
      await freshCounter.decrement();

      expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "" });
    });

    it("should clear badge text when counter reaches zero", async () => {
      const { default: freshCounter } = await import("../counter");
      await freshCounter.increment(1);
      await freshCounter.decrement();

      expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "" });
    });
  });

  describe("reset", () => {
    it("should reset the counter to zero and clear badge text", async () => {
      const { default: freshCounter } = await import("../counter");
      await freshCounter.increment(5);
      await freshCounter.reset();

      expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "" });
    });
  });

  describe("update", () => {
    it("should update the badge text with current counter value", async () => {
      const { default: freshCounter } = await import("../counter");
      await freshCounter.increment(7);
      mockSetBadgeText.mockClear();

      await freshCounter.update();

      expect(mockSetBadgeText).toHaveBeenCalledWith({ text: "7" });
    });

    it("should clear badge text if counter is zero", async () => {
      const { default: freshCounter } = await import("../counter");
      mockSetBadgeText.mockClear();

      await freshCounter.update();

      expect(mockSetBadgeText).toHaveBeenCalledWith({ text: "" });
    });
  });

  describe("integration with updateBrowserIcon", () => {
    it("should call updateBrowserIcon on increment", async () => {
      const { default: freshCounter } = await import("../counter");
      await freshCounter.increment();
      expect(updateBrowserIcon).toHaveBeenCalled();
    });

    it("should call updateBrowserIcon on decrement", async () => {
      const { default: freshCounter } = await import("../counter");
      await freshCounter.increment(1);
      vi.mocked(updateBrowserIcon).mockClear();
      await freshCounter.decrement();
      expect(updateBrowserIcon).toHaveBeenCalled();
    });

    it("should call updateBrowserIcon on reset", async () => {
      const { default: freshCounter } = await import("../counter");
      await freshCounter.reset();
      expect(updateBrowserIcon).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle errors from chrome.action.setBadgeText gracefully", async () => {
      const { default: freshCounter } = await import("../counter");
      mockSetBadgeText.mockRejectedValue(new Error("API Error"));

      // Should not throw
      await expect(freshCounter.increment()).resolves.not.toThrow();
    });

    it("should handle errors from updateBrowserIcon gracefully", async () => {
      const { default: freshCounter } = await import("../counter");
      vi.mocked(updateBrowserIcon).mockRejectedValue(new Error("Icon Error"));

      // Should not throw
      await expect(freshCounter.increment()).resolves.not.toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle large increment values", async () => {
      const { default: freshCounter } = await import("../counter");
      await freshCounter.increment(9999);
      expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "9999" });
    });

    it("should handle multiple rapid calls", async () => {
      const { default: freshCounter } = await import("../counter");
      const promises = [
        freshCounter.increment(1),
        freshCounter.increment(1),
        freshCounter.increment(1),
      ];
      await Promise.all(promises);

      // Counter should be at least 1, but exact value depends on race conditions
      const lastCall =
        mockSetBadgeText.mock.calls[mockSetBadgeText.mock.calls.length - 1];
      expect(lastCall?.[0].text).not.toBe("");
    });

    it("should convert counter to string correctly", async () => {
      const { default: freshCounter } = await import("../counter");
      mockSetBadgeText.mockResolvedValue(undefined);
      vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

      await freshCounter.increment(123);

      expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "123" });
      const lastCall =
        mockSetBadgeText.mock.calls[mockSetBadgeText.mock.calls.length - 1];
      expect(typeof lastCall?.[0].text).toBe("string");
    });
  });

  describe("singleton behavior", () => {
    it("should maintain state across different imports", async () => {
      // First instance
      const { default: instance1 } = await import("../counter");
      await instance1.reset();
      await instance1.increment(5);

      // Second instance with same state
      const { default: sameInstance } = await import("../counter");
      await sameInstance.increment(3);

      expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "8" });
    });
  });
});
