import * as debug from 'debug';
import { IReactionHandler } from "./IReactionhandler";
import { SheepBot } from "../discord";
import { RichEmbed, User, Message, TextChannel, MessageReaction, Role } from 'discord.js';
import { IRoleData } from '../dataTypes/role';

const roleLog = debug('bot:sheepData');

export class RoleReactions implements IReactionHandler {
  private roleMap: Map<string, IRoleData>;

  constructor(bot: SheepBot) {
    this.roleMap = new Map<string, IRoleData>();

    const roles = [];
    for (const role of bot.data.roles) {
      this.roleMap.set(role.emoji, role);
      roles.push(role.name);
    }
    roleLog("Loaded roles: " + roles.join(', '));
  }

  public processReaction(reaction: import("discord.js").MessageReaction, user: User): boolean {
    let success = false;

    const role = this.roleMap.get(reaction.emoji.name);
    if (role !== undefined) {
      this.doWork(reaction, user, role);
      success = true;
    } else {
      roleLog(reaction.emoji.name);
    }
    return success;
  }

  private async doWork(reaction: MessageReaction, user: User, role: IRoleData) {
    roleLog(`Successfully got ${role.name} for message with roleId ${role.roleId}`);
      const member = await reaction.message.guild.fetchMember(user.id);
      const userRole = member.roles.get(role.roleId);
      roleLog(member.roles);
      roleLog(userRole);
      if (userRole !== null && userRole !== undefined) {
        roleLog("Removing role from user " + user.username);
        member.removeRole(role.roleId);
        this.sendDestroyEmbed(reaction.message.channel as TextChannel, this.leaveEmbed(role, user));
      } else {
        roleLog("Adding role " + role.name + " " + role.roleId + " for user " + user.username);
        member.addRole(role.roleId);
        this.sendDestroyEmbed(reaction.message.channel as TextChannel, this.joinEmbed(role, user));
      }
      reaction.remove(user);
  }

  private async sendDestroyEmbed(channel: TextChannel, embed: RichEmbed) {
    const result = await channel.send(embed) as Message;
    result.delete(5000);
  }

  private joinEmbed(data: IRoleData, user: User): RichEmbed {
    const embed = new RichEmbed();
    embed.setTitle(data.name);
    embed.setDescription(user.username + " now has role " + data.name);
    embed.setColor(0x00FF00);
    return embed;
  }

  private leaveEmbed(data: IRoleData, user: User): RichEmbed {
    const embed = new RichEmbed();
    embed.setTitle(data.name);
    embed.setDescription(user.username + " no longer has role " + data.name);
    embed.setColor(0xFF0000);
    return embed;
  }

}
