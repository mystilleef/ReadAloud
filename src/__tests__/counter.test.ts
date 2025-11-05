/// <reference types="vitest/globals" />

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import badgeCounter from "../counter";
import updateBrowserIcon from "../icon";

// Mock chrome.action API
const mockSetBadgeText = vi.fn();

// Mock the icon module
vi.mock("../icon", () => ({
  default: vi.fn(),
}));

beforeEach(() => {
  global.chrome = {
    action: {
      setBadgeText: mockSetBadgeText,
    },
  } as unknown as typeof chrome;
});

describe("counter", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("BadgeCounter", () => {
    describe("increment", () => {
      it("should increment counter by 1 by default", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment();

        expect(mockSetBadgeText).toHaveBeenCalledWith({ text: "1" });
        expect(updateBrowserIcon).toHaveBeenCalledWith(1);
      });

      it("should increment counter by specified count", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(5);

        expect(mockSetBadgeText).toHaveBeenCalledWith({ text: "5" });
        expect(updateBrowserIcon).toHaveBeenCalledWith(5);
      });

      it("should increment counter multiple times", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(3);
        await badgeCounter.increment(2);

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "5" });
        expect(updateBrowserIcon).toHaveBeenLastCalledWith(5);
      });

      it("should handle zero increment", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(0);

        expect(mockSetBadgeText).toHaveBeenCalledWith({ text: "" });
        expect(updateBrowserIcon).toHaveBeenCalledWith(0);
      });

      it("should call update after incrementing", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(2);

        expect(mockSetBadgeText).toHaveBeenCalled();
        expect(updateBrowserIcon).toHaveBeenCalled();
      });

      it("should handle large increment values", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(999);

        expect(mockSetBadgeText).toHaveBeenCalledWith({ text: "999" });
        expect(updateBrowserIcon).toHaveBeenCalledWith(999);
      });
    });

    describe("decrement", () => {
      it("should decrement counter by 1", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(5);
        await badgeCounter.decrement();

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "4" });
        expect(updateBrowserIcon).toHaveBeenLastCalledWith(4);
      });

      it("should not go below 0 when decrementing", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.decrement();

        expect(mockSetBadgeText).toHaveBeenCalledWith({ text: "" });
        expect(updateBrowserIcon).toHaveBeenCalledWith(0);
      });

      it("should set counter to 0 when decrementing from 1", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(1);
        await badgeCounter.decrement();

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "" });
        expect(updateBrowserIcon).toHaveBeenLastCalledWith(0);
      });

      it("should decrement multiple times correctly", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(10);
        await badgeCounter.decrement();
        await badgeCounter.decrement();
        await badgeCounter.decrement();

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "7" });
        expect(updateBrowserIcon).toHaveBeenLastCalledWith(7);
      });

      it("should call update after decrementing", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(3);
        vi.clearAllMocks();
        await badgeCounter.decrement();

        expect(mockSetBadgeText).toHaveBeenCalled();
        expect(updateBrowserIcon).toHaveBeenCalled();
      });

      it("should remain at 0 when decrementing multiple times from 0", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.decrement();
        await badgeCounter.decrement();
        await badgeCounter.decrement();

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "" });
        expect(updateBrowserIcon).toHaveBeenLastCalledWith(0);
      });
    });

    describe("reset", () => {
      it("should reset counter to 0", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.increment(10);
        await badgeCounter.reset();

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "" });
        expect(updateBrowserIcon).toHaveBeenLastCalledWith(0);
      });

      it("should reset counter to 0 when already at 0", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.reset();

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "" });
        expect(updateBrowserIcon).toHaveBeenLastCalledWith(0);
      });

      it("should call update after resetting", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.increment(5);
        vi.clearAllMocks();
        await badgeCounter.reset();

        expect(mockSetBadgeText).toHaveBeenCalled();
        expect(updateBrowserIcon).toHaveBeenCalled();
      });

      it("should allow incrementing after reset", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.increment(10);
        await badgeCounter.reset();
        await badgeCounter.increment(3);

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "3" });
        expect(updateBrowserIcon).toHaveBeenLastCalledWith(3);
      });
    });

    describe("update", () => {
      it("should call updateText and updateBrowserIcon", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(5);

        expect(mockSetBadgeText).toHaveBeenCalled();
        expect(updateBrowserIcon).toHaveBeenCalledWith(5);
      });

      it("should display empty string for counter < 1", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();

        expect(mockSetBadgeText).toHaveBeenCalledWith({ text: "" });
      });

      it("should display counter value for counter >= 1", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(7);

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "7" });
      });

      it("should call chrome.action.setBadgeText with correct format", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(42);

        expect(mockSetBadgeText).toHaveBeenCalledWith({ text: "42" });
        expect(mockSetBadgeText).toHaveBeenCalledTimes(2); // once for reset, once for increment
      });
    });

    describe("updateText", () => {
      it("should set empty badge text when counter is 0", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();

        expect(mockSetBadgeText).toHaveBeenCalledWith({ text: "" });
      });

      it("should set badge text to counter value when > 0", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(15);

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "15" });
      });

      it("should convert counter to string correctly", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(123);

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "123" });
        expect(typeof mockSetBadgeText.mock.calls[1][0].text).toBe("string");
      });
    });

    describe("integration tests", () => {
      it("should handle complete increment/decrement/reset workflow", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(10);
        await badgeCounter.decrement();
        await badgeCounter.decrement();
        await badgeCounter.increment(5);
        await badgeCounter.reset();

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "" });
        expect(updateBrowserIcon).toHaveBeenLastCalledWith(0);
      });

      it("should maintain correct count through mixed operations", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(3);
        await badgeCounter.increment(2);
        await badgeCounter.decrement();
        await badgeCounter.increment(10);

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "14" });
        expect(updateBrowserIcon).toHaveBeenLastCalledWith(14);
      });

      it("should update icon on every operation", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        const resetCalls = vi.mocked(updateBrowserIcon).mock.calls.length;

        await badgeCounter.increment();
        const incrementCalls = vi.mocked(updateBrowserIcon).mock.calls.length;

        await badgeCounter.decrement();
        const decrementCalls = vi.mocked(updateBrowserIcon).mock.calls.length;

        expect(incrementCalls).toBeGreaterThan(resetCalls);
        expect(decrementCalls).toBeGreaterThan(incrementCalls);
      });
    });

    describe("error handling", () => {
      it("should propagate setBadgeText errors", async () => {
        const error = new Error("Failed to set badge text");
        mockSetBadgeText.mockRejectedValue(error);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await expect(badgeCounter.increment()).rejects.toThrow(
          "Failed to set badge text",
        );
      });

      it("should propagate updateBrowserIcon errors", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        const error = new Error("Failed to update icon");
        vi.mocked(updateBrowserIcon).mockRejectedValue(error);

        await expect(badgeCounter.increment()).rejects.toThrow(
          "Failed to update icon",
        );
      });

      it("should propagate errors during decrement", async () => {
        const error = new Error("Badge text error");
        mockSetBadgeText.mockRejectedValue(error);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await expect(badgeCounter.decrement()).rejects.toThrow(
          "Badge text error",
        );
      });

      it("should propagate errors during reset", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        const error = new Error("Icon error");
        vi.mocked(updateBrowserIcon).mockRejectedValue(error);

        await expect(badgeCounter.reset()).rejects.toThrow("Icon error");
      });
    });

    describe("edge cases", () => {
      it("should handle rapid sequential increments", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await Promise.all([
          badgeCounter.increment(),
          badgeCounter.increment(),
          badgeCounter.increment(),
        ]);

        // Counter should be at least 1, but exact value depends on race conditions
        const lastCall =
          mockSetBadgeText.mock.calls[mockSetBadgeText.mock.calls.length - 1];
        expect(lastCall[0].text).not.toBe("");
      });

      it("should handle increment with negative values (although not recommended)", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(5);
        await badgeCounter.increment(-3);

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "2" });
        expect(updateBrowserIcon).toHaveBeenLastCalledWith(2);
      });

      it("should handle very large counter values", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(Number.MAX_SAFE_INTEGER);

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({
          text: `${Number.MAX_SAFE_INTEGER}`,
        });
      });

      it("should return void on successful operations", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        const incrementResult = await badgeCounter.increment();
        const decrementResult = await badgeCounter.decrement();
        const resetResult = await badgeCounter.reset();

        expect(incrementResult).toBeUndefined();
        expect(decrementResult).toBeUndefined();
        expect(resetResult).toBeUndefined();
      });
    });

    describe("singleton behavior", () => {
      it("should export a singleton instance", async () => {
        mockSetBadgeText.mockResolvedValue(undefined);
        vi.mocked(updateBrowserIcon).mockResolvedValue(undefined);

        await badgeCounter.reset();
        await badgeCounter.increment(5);

        // Importing the same module should give the same instance with same state
        const { default: sameInstance } = await import("../counter");
        await sameInstance.increment(3);

        expect(mockSetBadgeText).toHaveBeenLastCalledWith({ text: "8" });
      });
    });
  });
});
