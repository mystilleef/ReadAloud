let counter = 0;

function incrementCounter(): void {
  counter += 1;
  setText(counter);
}

function decrementCounter(): void {
  counter -= 1;
  setText(counter);
  clearCounter();
}

function clearCounter(): void {
  chrome.tts.isSpeaking((speaking: boolean) => {
    if (speaking) return;
    counter = 0;
    setText(counter);
  });
}

function setText(count: number): void {
  chrome.browserAction.setBadgeText(
    { text: `${count === 0 ? "" : count}` }
  );
}

export { incrementCounter, decrementCounter, clearCounter };
