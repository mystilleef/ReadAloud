import { getMessage } from "@extend-chrome/messages";

export const [sendRead, readStream, waitForRead] = getMessage<string>("READ");
export const [
  sendSelectedText,
  selectedTextStream,
  waitForSelectedText
] = getMessage<string>("SELECTED_TEXT");
