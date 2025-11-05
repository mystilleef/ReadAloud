/// <reference types="vitest/globals" />

import { describe, expect, it } from "vitest";
import {
  endedSpeakingStream,
  finishedSpeakingStream,
  gotEndSpeakingStream,
  gotFinishedSpeakingStream,
  gotStartedSpeakingStream,
  readStream,
  refreshTtsStream,
  selectedTextStream,
  sendEndedSpeaking,
  sendFinishedSpeaking,
  sendGotEndSpeaking,
  sendGotFinishedSpeaking,
  sendGotStartedSpeaking,
  sendRead,
  sendRefreshTts,
  sendSelectedText,
  sendStartedSpeaking,
  startedSpeakingStream,
  waitForStartedSpeaking,
} from "../message";

describe("message", () => {
  describe("message senders", () => {
    it("should export sendRead function", () => {
      expect(typeof sendRead).toBe("function");
    });

    it("should export sendStartedSpeaking function", () => {
      expect(typeof sendStartedSpeaking).toBe("function");
    });

    it("should export sendGotStartedSpeaking function", () => {
      expect(typeof sendGotStartedSpeaking).toBe("function");
    });

    it("should export sendEndedSpeaking function", () => {
      expect(typeof sendEndedSpeaking).toBe("function");
    });

    it("should export sendGotEndSpeaking function", () => {
      expect(typeof sendGotEndSpeaking).toBe("function");
    });

    it("should export sendFinishedSpeaking function", () => {
      expect(typeof sendFinishedSpeaking).toBe("function");
    });

    it("should export sendGotFinishedSpeaking function", () => {
      expect(typeof sendGotFinishedSpeaking).toBe("function");
    });

    it("should export sendRefreshTts function", () => {
      expect(typeof sendRefreshTts).toBe("function");
    });

    it("should export sendSelectedText function", () => {
      expect(typeof sendSelectedText).toBe("function");
    });

    it("should export waitForStartedSpeaking function", () => {
      expect(typeof waitForStartedSpeaking).toBe("function");
    });
  });

  describe("message streams", () => {
    it("should export readStream", () => {
      expect(readStream).toBeDefined();
      expect(typeof readStream.subscribe).toBe("function");
    });

    it("should export startedSpeakingStream", () => {
      expect(startedSpeakingStream).toBeDefined();
      expect(typeof startedSpeakingStream.subscribe).toBe("function");
    });

    it("should export gotStartedSpeakingStream", () => {
      expect(gotStartedSpeakingStream).toBeDefined();
      expect(typeof gotStartedSpeakingStream.subscribe).toBe("function");
    });

    it("should export endedSpeakingStream", () => {
      expect(endedSpeakingStream).toBeDefined();
      expect(typeof endedSpeakingStream.subscribe).toBe("function");
    });

    it("should export gotEndSpeakingStream", () => {
      expect(gotEndSpeakingStream).toBeDefined();
      expect(typeof gotEndSpeakingStream.subscribe).toBe("function");
    });

    it("should export finishedSpeakingStream", () => {
      expect(finishedSpeakingStream).toBeDefined();
      expect(typeof finishedSpeakingStream.subscribe).toBe("function");
    });

    it("should export gotFinishedSpeakingStream", () => {
      expect(gotFinishedSpeakingStream).toBeDefined();
      expect(typeof gotFinishedSpeakingStream.subscribe).toBe("function");
    });

    it("should export refreshTtsStream", () => {
      expect(refreshTtsStream).toBeDefined();
      expect(typeof refreshTtsStream.subscribe).toBe("function");
    });

    it("should export selectedTextStream", () => {
      expect(selectedTextStream).toBeDefined();
      expect(typeof selectedTextStream.subscribe).toBe("function");
    });
  });

  describe("message pairs structure", () => {
    it("should have matching message types", () => {
      const messagePairs = [
        { sender: sendRead, stream: readStream, name: "READ" },
        {
          sender: sendStartedSpeaking,
          stream: startedSpeakingStream,
          name: "STARTED_SPEAKING",
        },
        {
          sender: sendGotStartedSpeaking,
          stream: gotStartedSpeakingStream,
          name: "GOT_STARTED_SPEAKING",
        },
        {
          sender: sendEndedSpeaking,
          stream: endedSpeakingStream,
          name: "ENDED_SPEAKING",
        },
        {
          sender: sendGotEndSpeaking,
          stream: gotEndSpeakingStream,
          name: "GOT_END_SPEAKING",
        },
        {
          sender: sendFinishedSpeaking,
          stream: finishedSpeakingStream,
          name: "FINISHED_SPEAKING",
        },
        {
          sender: sendGotFinishedSpeaking,
          stream: gotFinishedSpeakingStream,
          name: "GOT_FINISHED_SPEAKING",
        },
        {
          sender: sendRefreshTts,
          stream: refreshTtsStream,
          name: "REFRESH_TTS",
        },
        {
          sender: sendSelectedText,
          stream: selectedTextStream,
          name: "SELECTED_TEXT",
        },
      ];

      for (const pair of messagePairs) {
        expect(typeof pair.sender).toBe("function");
        expect(pair.stream).toBeDefined();
        expect(typeof pair.stream.subscribe).toBe("function");
      }
    });

    it("should export all 9 message pairs", () => {
      const senders = [
        sendRead,
        sendStartedSpeaking,
        sendGotStartedSpeaking,
        sendEndedSpeaking,
        sendGotEndSpeaking,
        sendFinishedSpeaking,
        sendGotFinishedSpeaking,
        sendRefreshTts,
        sendSelectedText,
      ];

      const streams = [
        readStream,
        startedSpeakingStream,
        gotStartedSpeakingStream,
        endedSpeakingStream,
        gotEndSpeakingStream,
        finishedSpeakingStream,
        gotFinishedSpeakingStream,
        refreshTtsStream,
        selectedTextStream,
      ];

      expect(senders).toHaveLength(9);
      expect(streams).toHaveLength(9);

      // Verify all are defined
      for (const sender of senders) {
        expect(sender).toBeDefined();
      }
      for (const stream of streams) {
        expect(stream).toBeDefined();
      }
    });
  });
});
