const logChromeErrorMessage = (): void => {
  const error = chrome.runtime.lastError || undefined;
  if (error) logError(error.message as string);
};

const chromeRuntimeError = (): boolean => !!chrome.runtime.lastError;

const logError = (message: string): void => console.error(message);

const doNothing = (_any?: object | undefined): void => undefined;

export { logChromeErrorMessage, chromeRuntimeError, logError, doNothing };
