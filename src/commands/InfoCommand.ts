import { CommandBase } from "./CommandBase";
import { RichEmbed } from "discord.js";

export class InfoCommand extends CommandBase {

  constructor() {
    super("info");
  }

  public handleCommand(originalMsg: import("discord.js").Message, name: string, args: string[]): boolean {
    const richEmbed = new RichEmbed();
    richEmbed.setTitle("Stir Party");
    richEmbed.setDescription("Stir Party is a game about sock puppets committing sudoku");
    originalMsg.channel.send(richEmbed);
    return true;
  }

}
