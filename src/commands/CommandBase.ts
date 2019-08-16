import { Message } from "discord.js";

export abstract class CommandBase {
  public name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public abstract handleCommand(originalMsg: Message, name: string, args: string[]): boolean;

}
