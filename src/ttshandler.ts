import badgeCounter from "./counter";
import updateBrowserIcon from "./icon";
import { isSpeaking, messageToContentScript } from "./utils";
import { logError } from "./error";
import type { __assign } from "tslib";
import { sendStartedSpeaking, sendStoppedSpeaking } from "./message";

const ALARM_NAME = "readaloud-tts-alarm";
const PERIOD_IN_MINUTES = 1;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.get(ALARM_NAME, present => {
    if (!present) chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: PERIOD_IN_MINUTES,
        periodInMinutes: PERIOD_IN_MINUTES
      });
  });
});

export function onTtsEvent(event: chrome.tts.TtsEvent): void {
  isSpeaking().then(updateBrowserIcon).catch(logError);
  onTts(event);
}

function onTts(event: chrome.tts.TtsEvent): void {
  if (event.type === "error") onError(`Error: ${event.errorMessage}`);
  else if (event.type === "start") onStart();
  else if (event.type === "interrupted") onInterrupted();
  else if (event.type === "end") onEnd();
}

function onError(message: string): void {
  stop();
  logError(message);
}

export function stop(): void {
  chrome.tts.stop();
  badgeCounter.reset().catch(logError);
  messageToContentScript(sendStoppedSpeaking, "").catch(logError);
}

function onStart() {
  refreshTts();
  messageToContentScript(sendStartedSpeaking, "").catch(logError);
}

function onInterrupted() {
  refreshTts();
  messageToContentScript(sendStoppedSpeaking, "").catch(logError);
}

function onEnd() {
  badgeCounter.decrement().catch(logError);
  refreshTts();
  messageToContentScript(sendStoppedSpeaking, "").catch(logError);
}

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM_NAME) resetTts();
});

export function resetTts(): void {
  isSpeaking().then(refreshTts).catch(logError);
}

function refreshTts(_speaking = false): void {
  chrome.tts.pause();
  chrome.tts.resume();
}
