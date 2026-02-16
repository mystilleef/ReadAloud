import { logError } from "./error";
import updateBrowserIcon from "./icon";

class BadgeCounter {
  private counter = 0;

  public async increment(count = 1): Promise<void> {
    this.counter += count;
    await this.update();
  }

  public async decrement(): Promise<void> {
    this.counter -= 1;
    if (this.counter < 1) this.counter = 0;
    await this.update();
  }

  public async reset(): Promise<void> {
    this.counter = 0;
    await this.update();
  }

  public async update(): Promise<void> {
    try {
      await this.updateText();
      await updateBrowserIcon(this.counter);
    } catch (error) {
      logError(String(error));
    }
  }

  private async updateText(): Promise<void> {
    await chrome.action.setBadgeText({
      text: `${this.counter < 1 ? "" : this.counter}`,
    });
  }
}

const badgeCounter = new BadgeCounter();
export default badgeCounter;
