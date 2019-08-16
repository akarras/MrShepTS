import * as path from 'path'
import * as YAML from 'yamljs'
import * as debug from 'debug';
import { IReactionHandler } from "./IReactionhandler";
import { SheepBot } from "../discord";
import { RichEmbed, GuildMember, User, ColorResolvable } from 'discord.js';

const roleLog = debug("bot:roles");

interface IRoleData {
  name: string;
  messageId: string;
  roleId: string;
  emoji: string;
  color: ColorResolvable;
}

export class RoleReactions implements IReactionHandler {
  private roleMap: Map<string, IRoleData>;

  constructor() {
    const roleConfig = YAML.load(path.resolve(__dirname, '../config/roles.yml'));
    this.roleMap = new Map<string, IRoleData>();

    const roles = [];
    for (const role of roleConfig.roles as IRoleData[]) {
      this.roleMap.set(role.messageId, role);
      roles.push(role.name);
    }

    roleLog("Loaded roles: " + roles.join(', '));
  }

  public processReaction(reaction: import("discord.js").MessageReaction, user: User): boolean {
    let success = false;

    const role = this.roleMap.get(reaction.message.id);
    if (role !== undefined) {
      roleLog("Successfully got user for role");
      if (reaction.message.member.roles.has(role.roleId)) {
        reaction.message.member.removeRole(role.roleId);
      } else {
        reaction.message.member.addRole(role.roleId);
        reaction.message.channel.send(this.joinEmbed(role, user));
      }
      success = true;
    }
    return success;
  }

  private joinEmbed(data: IRoleData, user: User): RichEmbed {
    const embed = new RichEmbed();
    embed.setTitle(data.name);
    embed.setDescription(user.username + " now has role " + data.name);
    embed.setColor(0x00FF00);
    return embed;
  }

}
