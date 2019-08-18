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
    this.handlers.push(new RoleReactions(bot));

    this.bot.client.on("messageReactionAdd", (reaction: MessageReaction, user: User) => {
      logReact("Event triggered for message ID: " + reaction.message.id);
      this.dispatchReaction(reaction, user);
    });

    this.bot.client.on("ready", () => {
      this.subscribeToReactions();
    })
  }

  public async dispatchReaction(reaction: MessageReaction, user: User) {
    for (const handler of this.handlers) {
      if (user.id !== this.bot.client.user.id) { // block user id
        // loop until we get a positive response
        if (handler.processReaction(reaction, user)) {
          break;
        }
      }
    }
  }

  // Fetches messages for channels we want to react against
  private async subscribeToReactions() {
    const channels = this.bot.config.settings.reactionChannels;
    for (const channel of channels) {
      const discordChannel = this.bot.client.channels.get(channel) as TextChannel;
      if (discordChannel !== undefined) {
        const messages = await discordChannel.fetchMessages();
        for (const [, message] of messages) {
          const reactions = await message.awaitReactions((e) => true);
          for (const [, react] of reactions) {
            for (const [, user] of react.users) {
              this.dispatchReaction(react, user);
            }
          }
          logReact(message.content);
        }
      } else {
        logReact("Error, failed to get messages for channel: " + channel);
      }
    }
  }
}
