export function logChromeErrorMessage(): void {
  const error = chrome.runtime.lastError;
  if (error) logError(error.message as string);
}

export function logError(message: string): void {
  console.error(message);
}

export function chromeRuntimeError(): boolean {
  return Boolean(chrome.runtime.lastError);
}

export function doNothing(_any?: unknown): void {
  // Doing nothing
}
