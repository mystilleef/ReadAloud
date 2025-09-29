import {
  getPitch,
  getRate,
  getVoiceName,
  storeDefaultOptions,
  storePitch,
  storeRate,
  storeVoice,
} from "./storage";
import { getTtsVoices } from "./utils";

const rateEl = document.getElementById("rate") as HTMLInputElement;
const rateValueEl = document.getElementById("rate-value") as HTMLSpanElement;
const pitchEl = document.getElementById("pitch") as HTMLInputElement;
const pitchValueEl = document.getElementById("pitch-value") as HTMLSpanElement;
const voiceEl = document.getElementById("voice") as HTMLSelectElement;
const resetEl = document.getElementById("reset") as HTMLButtonElement;

async function init() {
  // Load and set Rate
  const rate = await getRate();
  rateEl.value = String(rate);
  rateValueEl.textContent = String(rate);

  // Load and set Pitch
  const pitch = await getPitch();
  pitchEl.value = String(pitch);
  pitchValueEl.textContent = String(pitch);

  // Load and set Voices
  const voices = await getTtsVoices();
  const currentVoiceName = await getVoiceName();
  voiceEl.innerHTML = ""; // Clear existing options
  for (const voice of voices) {
    const option = document.createElement("option");
    option.value = voice.voiceName || "";
    option.textContent = voice.voiceName || "";
    if (voice.voiceName === currentVoiceName) {
      option.selected = true;
    }
    voiceEl.appendChild(option);
  }
}

// Event Listeners to store changes
rateEl.addEventListener("input", () => {
  const newRate = Number(rateEl.value);
  rateValueEl.textContent = String(newRate);
  storeRate(newRate);
});

pitchEl.addEventListener("input", () => {
  const newPitch = Number(pitchEl.value);
  pitchValueEl.textContent = String(newPitch);
  storePitch(newPitch);
});

voiceEl.addEventListener("change", () => {
  storeVoice(voiceEl.value);
});

resetEl.addEventListener("click", async () => {
  await storeDefaultOptions();
  // Re-initialize the UI to show the default values
  await init();
});

// Listen for changes from other parts of the extension (e.g., context menu)
chrome.storage.onChanged.addListener(() => {
  init();
});

// Initial load
document.addEventListener("DOMContentLoaded", init);
