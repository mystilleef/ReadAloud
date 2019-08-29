const logChromeErrorMessage = (): void => {
  const error = chrome.runtime.lastError || undefined;
  if (error) console.error(error.message);
};

const chromeRuntimeError = (): boolean => !!chrome.runtime.lastError;

const logError = (message: string): void => console.error(message);

const logNothing = (_any: string): void => undefined;

export { logChromeErrorMessage, chromeRuntimeError, logError, logNothing };
