const logChromeErrorMessage = (): void => {
  const error = chrome.runtime.lastError || undefined;
  if (error) logError(error.message as string);
};

const chromeRuntimeError = (): boolean => Boolean(chrome.runtime.lastError);

const logError = (message: string): void => console.error(message);

const doNothing = (_any?: unknown | undefined): void => undefined;

export { logChromeErrorMessage, chromeRuntimeError, logError, doNothing };
