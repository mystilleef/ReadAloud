const logChromeErrorMessage = (): void => {
  const error = chrome.runtime.lastError || undefined;
  if (error) console.error(error.message);
};

const chromeRuntimeError = (): boolean => !!chrome.runtime.lastError;

export { logChromeErrorMessage, chromeRuntimeError };
