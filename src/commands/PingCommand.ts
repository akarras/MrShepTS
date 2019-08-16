import { CommandBase } from "./CommandBase";

export class PingCommand extends CommandBase {

  constructor() {
    super("ping");
  }

  public handleCommand(originalMsg: import("discord.js").Message, name: string, args: string[]): boolean {
    const subArgs = args.join(",");
    originalMsg.channel.send("Pong!");
    return true;
  }

}
