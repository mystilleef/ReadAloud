import { logError } from "./error";
import { isSpeaking } from "./utils";

class BadgeCounter {
  private counter = 0;

  public increment(): void {
    this.counter += 1;
    this.checkSpeakingState().catch(e => logError(e.message));
  }

  public decrement(): void {
    this.counter -= 1;
    this.checkSpeakingState().catch(e => logError(e.message));
  }

  private async checkSpeakingState(): Promise<void> {
    await isSpeaking() ? this.updateText() : this.reset();
  }

  public reset(): void {
    this.counter = 0;
    this.updateText();
  }

  private updateText(): void {
    chrome.browserAction.setBadgeText(
      { text: `${this.counter === 0 ? "" : this.counter}` }
    );
  }
}

export { BadgeCounter as default };
