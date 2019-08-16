import { CommandBase } from "./CommandBase";
import { RichEmbed, Message } from "discord.js";

export class HelpCommand extends CommandBase {
  constructor() {
    super("help");
  }

  public handleCommand(originalMsg: import("discord.js").Message, name: string, args: string[]): boolean {
    this.postHelp(originalMsg);
    return true;
  }

  private async postHelp(msg: Message) {
    const embed = new RichEmbed();
    embed.setTitle("Mr. Shep - Help");
    embed.setDescription(
      "**commands** \n" +
      "• info - prints information about Stir Party\n" +
      "• help - Displays this message\n" +
      "• color #[colorhex] - Lets you set your color\n");
    embed.setColor(0xdead00);
    msg.reply(embed);
  }

}
