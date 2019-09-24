import { CommandBase } from "./CommandBase";
import { SheepBot } from "../discord";
import { TextChannel, RichEmbed, Message, Channel, Emoji } from "discord.js";
import YAML = require("yamljs");
import path = require("path");
import debug = require("debug");
import { IRoleData } from "../dataTypes/role";
import { SheepData } from "../data/SheepData";

const roleLog = debug('bot:rolelog');

export class ResendRolesCommands extends CommandBase {

  private bot: SheepBot;
  private rolesChannelId: string;
  constructor(bot: SheepBot) {
    super("resendroles");
    this.bot = bot;
    this.rolesChannelId = bot.data.config.settings.rolesChannel;
  }

  public handleCommand(originalMsg: import("discord.js").Message, name: string, args: string[]): boolean {
    let success = false;
    if (originalMsg.member.hasPermission("ADMINISTRATOR")) {
      originalMsg.reply("Resending commands...");
      this.resendMessages();
      success = true;
    }
    return success;
  }

  private async resendMessages() {
    const rolesChannel = this.bot.client.channels.get(this.rolesChannelId) as TextChannel;
    roleLog("Roles channel ID " + this.rolesChannelId);
    if (rolesChannel !== undefined ) {
      const fetched = await rolesChannel.fetchMessages();
      for (const [, msg] of fetched) {
        msg.delete();
      }

      const rolesEmbed = new RichEmbed();
      rolesEmbed.setTitle("Role Notifications");
      rolesEmbed.setDescription("Self opt into different roles");
      roleLog("Data", this.bot.data);
      const roles = this.bot.data.roles;
      const emojis = [] as Emoji[];
      for (const role of roles) {
        const emoji = this.bot.client.emojis.find((e) => e.name === role.emoji );
        rolesEmbed.addField(role.name, role.description + "\n"
        + "React with " + emoji);
        emojis.push(emoji);
      }

      rolesEmbed.setColor(0xdead00);

      const colorsEmbed = new RichEmbed();
      colorsEmbed.setTitle("Custom Colors");
      colorsEmbed.setDescription("Go to #bot-spam, and use the command !sp color #??????.");
      colorsEmbed.setColor(0x0b00b00);

      const emojiMessage = await rolesChannel.send(rolesEmbed) as Message;
      for (const emoji of emojis) {
        await emojiMessage.react(emoji);
      }

      const message = await rolesChannel.send(colorsEmbed) as Message;
      for (const role of this.bot.data.roles) {
        role.messageId = message.id;
      }
      this.bot.data.resaveRoles();
    }
  }
}
