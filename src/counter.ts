class BadgeCounter {
  private counter = 0;

  public increment(): void {
    this.counter += 1;
    this.check();
  }

  public decrement(): void {
    this.counter -= 1;
    this.check();
  }

  public reset(): void {
    this.counter = 0;
    this.updateText();
  }

  private check(): void {
    chrome.tts.isSpeaking((speaking: boolean) => {
      if (speaking) this.updateText();
      else this.reset();
    });
  }

  private updateText(): void {
    chrome.browserAction.setBadgeText(
      { text: `${this.counter === 0 ? "" : this.counter}` }
    );
  }
}

const badgeCounter = new BadgeCounter();

export { badgeCounter as default };
