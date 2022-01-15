import { getMessage } from "@extend-chrome/messages";

export const [sendRead, readStream, ] =
  getMessage<string>("READ");

export const [sendSelectedText, selectedTextStream] =
  getMessage<string>("SELECTED_TEXT");
