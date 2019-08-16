import { CommandBase } from "./CommandBase";
import { Message, User, ColorResolvable, GuildMember, MessageEmbedProvider, Guild, Role } from "discord.js";
import debug = require("debug");
import { userInfo } from "os";

const colorRegex = new RegExp("^#([A-Fa-f0-9]{6})$");

const logColor = debug('bot:colorCommand');

export class ColorCommand extends CommandBase {
  constructor() {
    super("color");
  }

  public handleCommand(originalMsg: import("discord.js").Message, name: string, args: string[]): boolean {
    if (originalMsg.channel.type !== 'dm') {
      const color = args[0];
      if (colorRegex.test(color)) {
        this.toggleUserRole(originalMsg, color.toUpperCase());
      } else {
        this.sendRegexFailure(originalMsg);
      }
    } else {
      this.sendChannelFailure(originalMsg);
    }

    return true;
  }

  private async sendRegexFailure(originalMsg: Message) {
    const msg = await originalMsg.reply("Invalid arguments, please make sure your color looks like #XXXXXX") as Message;
    msg.delete(10000);
  }

  private async sendChannelFailure(originalMsg: Message) {
    const response = await originalMsg.reply("I can only set your color when you're in a server chat") as Message;
    response.delete(10000);
  }

  // sets up the role, and assumes the string has been validated
  private async toggleUserRole(message: Message, color: string) {
    const user = message.member;

    const currentRole = user.roles.find((e) => e.name === color);
    if (currentRole !== null) {
      user.removeRole(currentRole);
      const rs = await message.reply("Removed color " + currentRole.name) as Message;
      rs.delete(10000);
    } else {
      await this.removeColorRoles(user);
      const role = await this.getGuildColorRole(user.guild, color);
      if (role !== null) {
        logColor("Adding user", user.displayName, "to role", role.name);
        message.reply("Added color " + role.name);
        await user.addRole(role);
      } else {
        logColor("Unable to get role");
        const failMsg = await message.reply("Sorry, I had something go wrong and can't do it.") as Message;
        failMsg.delete(10000);
      }
    }
    // cleanup any roles that might be unused
    await this.cleanupColorRoles(user.guild);
  }

  private async getGuildColorRole(guild: Guild, color: string): Promise<Role> {
    let role = guild.roles.find((r) => r.name === color);
    if (role === null) {
      logColor("Creating color role for color: ", color);
      const roleData = {name: color, color: color.slice(1)};
      role = await guild.createRole(roleData);
    }
    return role;
  }

  private async removeColorRoles(member: GuildMember): Promise<boolean> {
    const colorRoles = member.roles.filter((f) => f.name.indexOf("#") === 0);
    for (const [, role] of colorRoles) {
      await role.delete();
    }
    return true;
  }

  private async cleanupColorRoles(guild: Guild) {
    for (const [, role] of guild.roles) {
      if (role.members.size <= 0) {
        logColor("Removing role ", role.name);
        role.delete();
      }
    }
  }

}
