import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  chromeRuntimeError,
  doNothing,
  logChromeErrorMessage,
  logError,
} from "../error";

describe("error", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    global.chrome = {
      runtime: {
        lastError: undefined,
      },
    } as unknown as typeof chrome;
  });

  describe("logError", () => {
    it("should log the error message to console.error", () => {
      const message = "Test error message";
      logError(message);
      expect(consoleErrorSpy).toHaveBeenCalledWith(message);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle empty string", () => {
      logError("");
      expect(consoleErrorSpy).toHaveBeenCalledWith("");
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle multi-line error messages", () => {
      const message = "Line 1\nLine 2\nLine 3";
      logError(message);
      expect(consoleErrorSpy).toHaveBeenCalledWith(message);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle special characters in error messages", () => {
      const message = "Error with special chars: !@#$%^&*()";
      logError(message);
      expect(consoleErrorSpy).toHaveBeenCalledWith(message);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("logChromeErrorMessage", () => {
    it("should log error message when chrome.runtime.lastError exists", () => {
      const errorMessage = "Chrome runtime error";
      global.chrome.runtime.lastError = { message: errorMessage };

      logChromeErrorMessage();

      expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("should not log anything when chrome.runtime.lastError is undefined", () => {
      global.chrome.runtime.lastError = undefined;

      logChromeErrorMessage();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should not log anything when chrome.runtime.lastError is null", () => {
      global.chrome.runtime.lastError = null as unknown as
        | chrome.runtime.LastError
        | undefined;

      logChromeErrorMessage();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should handle empty error message from chrome.runtime.lastError", () => {
      global.chrome.runtime.lastError = { message: "" };

      logChromeErrorMessage();

      expect(consoleErrorSpy).toHaveBeenCalledWith("");
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle error messages with special characters", () => {
      const errorMessage = "Error: Invalid input <script>alert('xss')</script>";
      global.chrome.runtime.lastError = { message: errorMessage };

      logChromeErrorMessage();

      expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple consecutive calls", () => {
      global.chrome.runtime.lastError = { message: "Error 1" };
      logChromeErrorMessage();

      global.chrome.runtime.lastError = { message: "Error 2" };
      logChromeErrorMessage();

      global.chrome.runtime.lastError = undefined;
      logChromeErrorMessage();

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, "Error 1");
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, "Error 2");
    });
  });

  describe("chromeRuntimeError", () => {
    it("should return true when chrome.runtime.lastError exists with message", () => {
      global.chrome.runtime.lastError = { message: "Some error" };

      const result = chromeRuntimeError();

      expect(result).toBe(true);
    });

    it("should return true when chrome.runtime.lastError exists with empty message", () => {
      global.chrome.runtime.lastError = { message: "" };

      const result = chromeRuntimeError();

      expect(result).toBe(true);
    });

    it("should return false when chrome.runtime.lastError is undefined", () => {
      global.chrome.runtime.lastError = undefined;

      const result = chromeRuntimeError();

      expect(result).toBe(false);
    });

    it("should return false when chrome.runtime.lastError is null", () => {
      global.chrome.runtime.lastError = null as unknown as
        | chrome.runtime.LastError
        | undefined;

      const result = chromeRuntimeError();

      expect(result).toBe(false);
    });

    it("should return consistent results for multiple calls with same state", () => {
      global.chrome.runtime.lastError = { message: "Error" };

      expect(chromeRuntimeError()).toBe(true);
      expect(chromeRuntimeError()).toBe(true);
      expect(chromeRuntimeError()).toBe(true);
    });

    it("should reflect changes in chrome.runtime.lastError state", () => {
      global.chrome.runtime.lastError = undefined;
      expect(chromeRuntimeError()).toBe(false);

      global.chrome.runtime.lastError = { message: "Error" };
      expect(chromeRuntimeError()).toBe(true);

      global.chrome.runtime.lastError = undefined;
      expect(chromeRuntimeError()).toBe(false);
    });

    it("should not modify chrome.runtime.lastError", () => {
      const errorObj = { message: "Test error" };
      global.chrome.runtime.lastError = errorObj;

      chromeRuntimeError();

      expect(global.chrome.runtime.lastError).toBe(errorObj);
      expect(global.chrome.runtime.lastError.message).toBe("Test error");
    });
  });

  describe("doNothing", () => {
    it("should not throw when called with no arguments", () => {
      expect(() => doNothing()).not.toThrow();
    });

    it("should not throw when called with undefined", () => {
      expect(() => doNothing(undefined)).not.toThrow();
    });

    it("should not throw when called with null", () => {
      expect(() => doNothing(null)).not.toThrow();
    });

    it("should not throw when called with a string", () => {
      expect(() => doNothing("test")).not.toThrow();
    });

    it("should not throw when called with a number", () => {
      expect(() => doNothing(42)).not.toThrow();
    });

    it("should not throw when called with a boolean", () => {
      expect(() => doNothing(true)).not.toThrow();
      expect(() => doNothing(false)).not.toThrow();
    });

    it("should not throw when called with an object", () => {
      expect(() => doNothing({ key: "value" })).not.toThrow();
    });

    it("should not throw when called with an array", () => {
      expect(() => doNothing([1, 2, 3])).not.toThrow();
    });

    it("should not throw when called with a function", () => {
      expect(() => doNothing(() => {})).not.toThrow();
    });

    it("should return undefined", () => {
      expect(doNothing()).toBeUndefined();
      expect(doNothing("test")).toBeUndefined();
      expect(doNothing(42)).toBeUndefined();
    });

    it("should not execute function arguments", () => {
      const mockFn = vi.fn();
      doNothing(mockFn);
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should not log to console", () => {
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});
      doNothing("test");
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should handle multiple consecutive calls", () => {
      expect(() => {
        doNothing();
        doNothing(1);
        doNothing("test");
        doNothing({ a: 1 });
      }).not.toThrow();
    });
  });

  describe("integration scenarios", () => {
    it("should handle typical error flow: check error, log if exists", () => {
      global.chrome.runtime.lastError = { message: "API call failed" };

      if (chromeRuntimeError()) {
        logChromeErrorMessage();
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith("API call failed");
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle typical success flow: check error, no log if absent", () => {
      global.chrome.runtime.lastError = undefined;

      if (chromeRuntimeError()) {
        logChromeErrorMessage();
      }

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should handle callback pattern with error checking", () => {
      const callback = () => {
        if (chromeRuntimeError()) {
          logChromeErrorMessage();
        } else {
          doNothing();
        }
      };

      // Simulate error case
      global.chrome.runtime.lastError = { message: "Callback error" };
      callback();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Callback error");

      // Simulate success case
      consoleErrorSpy.mockClear();
      global.chrome.runtime.lastError = undefined;
      callback();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should handle doNothing as error callback placeholder", () => {
      const apiCall = (callback: (result?: unknown) => void) => {
        callback(undefined);
      };

      expect(() => apiCall(doNothing)).not.toThrow();
    });
  });
});
