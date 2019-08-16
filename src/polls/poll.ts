import * as Discord from "discord.js";
import debug = require("debug");

const letters = ['🇦', '🇧', '🇨', '🇩', '🇪'];

const logPoll = debug("bot:polls");

export class Poll {
  private question: string;
  private options: string;
  constructor(question: string, options: string) {
    this.question = question;
    this.options = options;
    logPoll("poll created question:", question, 'options', options);
  }

  public getMessage() {
    const embed = new Discord.RichEmbed();
    embed.setColor(0xB00B30);
    embed.setTitle("Stir Party Poll");
    let description = this.question + '\n';
    for (let i = 0; i < this.options.length; i++) {
      description += letters[i] + this.options[i] + '\n';
    }

    embed.setDescription(description);
    return embed;
  }

  private getReactions(): string[] {
    const reactions = letters.slice(0, this.options.length);
    return reactions;
  }
}
