import { SheepBot } from "../discord";
import debug = require("debug");

const statusLog = debug('bot:status');

export class StatusUpdater {
  private bot: SheepBot;
  private timer?: NodeJS.Timer;
  constructor(bot: SheepBot) {
    this.bot = bot;
    this.bot.client.on("ready", () => {
      this.setStatus(this.getRandomActivity());
      if (this.timer === undefined) {
        this.timer = setInterval(() => {
          this.setStatus(this.getRandomActivity());
        }, bot.data.config.settings.activitySwapTimeMs as number);
      }
    });
  }

  private getRandomActivity(): string {
    if (this.bot.data.config.settings.activities.length !== undefined) {
      const randSelection = Math.floor(Math.random() * this.bot.data.config.settings.activities.length);
      return this.bot.data.config.settings.activities[randSelection];
    } else {
      return "Couldn't get activities";
    }
  }

  private setStatus(status: string) {
    try {
    this.bot.client.user.setActivity(status);
      statusLog("Status set to " + status);
    } catch (e) {
      statusLog("Error, failed to configure. Err stack" + e.stack);
    }
  }

}
