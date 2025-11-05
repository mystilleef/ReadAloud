/// <reference types="vitest/globals" />

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import updateBrowserIcon from "../icon";

// Mock chrome.action API
const mockSetIcon = vi.fn();
const mockSetTitle = vi.fn();

beforeEach(() => {
  global.chrome = {
    action: {
      setIcon: mockSetIcon,
      setTitle: mockSetTitle,
    },
  } as unknown as typeof chrome;
});

describe("icon", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("updateBrowserIcon", () => {
    it("should set default icon when counter is 0", async () => {
      mockSetIcon.mockResolvedValue(undefined);
      mockSetTitle.mockResolvedValue(undefined);

      await updateBrowserIcon(0);

      expect(mockSetIcon).toHaveBeenCalledTimes(1);
      expect(mockSetIcon).toHaveBeenCalledWith({ path: "images/default.png" });
      expect(mockSetTitle).toHaveBeenCalledTimes(1);
      expect(mockSetTitle).toHaveBeenCalledWith({
        title: "Read aloud selected text",
      });
    });

    it("should set stop icon when counter is greater than 0", async () => {
      mockSetIcon.mockResolvedValue(undefined);
      mockSetTitle.mockResolvedValue(undefined);

      await updateBrowserIcon(5);

      expect(mockSetIcon).toHaveBeenCalledTimes(1);
      expect(mockSetIcon).toHaveBeenCalledWith({ path: "images/stop.png" });
      expect(mockSetTitle).toHaveBeenCalledTimes(1);
      expect(mockSetTitle).toHaveBeenCalledWith({ title: "Stop reading" });
    });

    it("should set stop icon when counter is 1", async () => {
      mockSetIcon.mockResolvedValue(undefined);
      mockSetTitle.mockResolvedValue(undefined);

      await updateBrowserIcon(1);

      expect(mockSetIcon).toHaveBeenCalledTimes(1);
      expect(mockSetIcon).toHaveBeenCalledWith({ path: "images/stop.png" });
      expect(mockSetTitle).toHaveBeenCalledTimes(1);
      expect(mockSetTitle).toHaveBeenCalledWith({ title: "Stop reading" });
    });

    it("should handle setIcon errors", async () => {
      const error = new Error("Failed to set icon");
      mockSetIcon.mockRejectedValue(error);

      await expect(updateBrowserIcon(5)).rejects.toThrow("Failed to set icon");
    });

    it("should handle setTitle errors", async () => {
      mockSetIcon.mockResolvedValue(undefined);
      const error = new Error("Failed to set title");
      mockSetTitle.mockRejectedValue(error);

      await expect(updateBrowserIcon(5)).rejects.toThrow("Failed to set title");
    });

    it("should call both setIcon and setTitle in sequence for default icon", async () => {
      const callOrder: string[] = [];

      mockSetIcon.mockImplementation(async () => {
        callOrder.push("setIcon");
      });
      mockSetTitle.mockImplementation(async () => {
        callOrder.push("setTitle");
      });

      await updateBrowserIcon(0);

      expect(callOrder).toEqual(["setIcon", "setTitle"]);
    });

    it("should call both setIcon and setTitle in sequence for stop icon", async () => {
      const callOrder: string[] = [];

      mockSetIcon.mockImplementation(async () => {
        callOrder.push("setIcon");
      });
      mockSetTitle.mockImplementation(async () => {
        callOrder.push("setTitle");
      });

      await updateBrowserIcon(3);

      expect(callOrder).toEqual(["setIcon", "setTitle"]);
    });

    it("should handle negative counter values as truthy (set stop icon)", async () => {
      mockSetIcon.mockResolvedValue(undefined);
      mockSetTitle.mockResolvedValue(undefined);

      await updateBrowserIcon(-1);

      expect(mockSetIcon).toHaveBeenCalledWith({ path: "images/stop.png" });
      expect(mockSetTitle).toHaveBeenCalledWith({ title: "Stop reading" });
    });

    it("should handle large counter values", async () => {
      mockSetIcon.mockResolvedValue(undefined);
      mockSetTitle.mockResolvedValue(undefined);

      await updateBrowserIcon(999);

      expect(mockSetIcon).toHaveBeenCalledWith({ path: "images/stop.png" });
      expect(mockSetTitle).toHaveBeenCalledWith({ title: "Stop reading" });
    });

    it("should return void/undefined on success", async () => {
      mockSetIcon.mockResolvedValue(undefined);
      mockSetTitle.mockResolvedValue(undefined);

      const result = await updateBrowserIcon(0);

      expect(result).toBeUndefined();
    });
  });
});
