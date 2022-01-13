export function logError(message: string): void {
  console.log(message);
}

export function logChromeErrorMessage(): void {
  const error = chrome.runtime.lastError || undefined;
  if (error) logError(error.message as string);
}

export function chromeRuntimeError(): boolean {
  return Boolean(chrome.runtime.lastError);
}

export function doNothing(_any?: unknown | undefined): void {
  return undefined;
}

