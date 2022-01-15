import { chromeaction } from "./constants";
import { isSpeaking } from "./utils";

class BadgeCounter {
  private counter = 0;

  public async increment(): Promise<void> {
    this.counter += 1;
    await this.checkSpeakingState();
  }

  public async decrement(): Promise<void> {
    this.counter -= 1;
    await this.checkSpeakingState();
  }

  private async checkSpeakingState(): Promise<void> {
    await isSpeaking() ? await this.updateText() : await this.reset();
  }

  public async reset(): Promise<void> {
    this.counter = 0;
    await this.updateText();
  }

  private async updateText(): Promise<void> {
    return new Promise<void>(resolve => {
      resolve(
        chromeaction.setBadgeText({
          text: `${this.counter === 0 ? "" : this.counter}`
        })
      );
    });
  }
}

const badgeCounter = new BadgeCounter();

export { badgeCounter as default };
