const logChromeErrorMessage = (): void => {
  const error = chrome.runtime.lastError || undefined;
  if (error) console.error(error.message);
};

const chromeRuntimeError = (): boolean => !!chrome.runtime.lastError;

const logError = (message: string): void => console.error(message);

const logMessage = (message: string): void => console.log(message);

const log = (message: string): void => logMessage(message);

export { logChromeErrorMessage, log, chromeRuntimeError, logError, logMessage };
