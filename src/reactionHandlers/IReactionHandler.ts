import { MessageReaction, User } from "discord.js";

export interface IReactionHandler {
  // Process a reaction, return true if you handled it
  processReaction(reaction: MessageReaction, user: User): boolean;
}
