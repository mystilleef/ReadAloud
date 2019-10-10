import { logError } from "./error";
import { isSpeaking } from "./utils";

class BadgeCounter {
  private counter = 0;

  public increment(): void {
    this.counter += 1;
    this.checkSpeakingState().catch(logError);
  }

  public decrement(): void {
    this.counter -= 1;
    this.checkSpeakingState().catch(logError);
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

const badgeCounter = new BadgeCounter();

export { badgeCounter as default };
