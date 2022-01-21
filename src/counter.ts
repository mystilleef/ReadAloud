import updateBrowserIcon from "./icon";

class BadgeCounter {
  private counter = 0;

  public async increment(): Promise<void> {
    this.counter += 1;
    await this.update();
  }

  public async decrement(): Promise<void> {
    if (this.counter > 0) this.counter -= 1;
    await this.update();
  }

  public async reset(): Promise<void> {
    this.counter = 0;
    await this.update();
  }

  public async update(): Promise<void> {
    await this.updateText();
    await updateBrowserIcon(this.counter);
  }

  private async updateText(): Promise<void> {
    await chrome.action.setBadgeText({
      text: `${this.counter === 0 ? "" : this.counter}`
    });
  }
}

const badgeCounter = new BadgeCounter();

export { badgeCounter as default };
