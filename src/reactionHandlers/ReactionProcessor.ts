import { SheepBot } from "../discord";
import { MessageReaction, User, TextChannel } from "discord.js";
import debug = require("debug");
import { IReactionHandler } from "./IReactionhandler";
import { RoleReactions } from "./RoleReactions";

const logReact = debug("bot:reactions");

export class ReactionProcessor {
  private bot: SheepBot;
  private handlers: IReactionHandler[];

  public constructor(bot: SheepBot) {
    this.bot = bot;
    this.handlers = [];
    this.handlers.push(new RoleReactions());

    this.bot.client.on("messageReactionAdd", (reaction: MessageReaction, user: User) => {
      for (const handler of this.handlers) {
        // loop until we get a positive response
        if (handler.processReaction(reaction, user)) {
          break;
        }
      }
    });

    this.subscribeToReactions();
  }

  // Fetches messages for channels we want to react against
  private async subscribeToReactions() {
    const channels = this.bot.config.settings.reactionChannels;
    for (const channel of channels) {
      const discordChannel = this.bot.client.channels.get(channel) as TextChannel;
      if (discordChannel !== undefined) {
        discordChannel.fetchMessages();
      }
    }
  }
}
