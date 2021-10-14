const logChromeErrorMessage = (): void => {
  const error = chrome.runtime.lastError || undefined;
  if (error) logError(error.message as string);
};

const logError = (message: string): void => console.error(message);

const chromeRuntimeError = (): boolean => Boolean(chrome.runtime.lastError);

const doNothing = (_any?: unknown | undefined): void => undefined;

export { logChromeErrorMessage, chromeRuntimeError, logError, doNothing };
