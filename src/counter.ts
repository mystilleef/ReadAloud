class BadgeCounter {
  private counter = 0;

  public increment(): void {
    this.counter += 1;
    this.checkSpeakingState();
  }

  public decrement(): void {
    this.counter -= 1;
    this.checkSpeakingState();
  }

  public reset(): void {
    this.counter = 0;
    this.updateText();
  }

  private checkSpeakingState(): void {
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

export { BadgeCounter as default };
