import * as debug from 'debug'
import * as path from 'path'
import * as YAML from 'yamljs'
import { Message, TextChannel, DiscordAPIError, DMChannel } from 'discord.js';
import { CommandBase } from './CommandBase';
import { PingCommand } from './PingCommand';
import { logError, SheepBot } from '../discord';
import { InfoCommand } from './InfoCommand';
import { ColorCommand } from './ColorCommand';
import { HelpCommand } from './HelpCommand';
import { ResendRolesCommands } from './ResendRolesCommand';

const logCmd = debug('bot:command');

export class CommandProcessor {
  private aliases: any;
  private bot: SheepBot;
  private commandMap: Map<string, CommandBase>;
  private aliasMap: Map<string, string>;

  constructor(bot: SheepBot) {
    this.aliases = YAML.load(path.resolve(__dirname, '../config/commandAliases.yml'));
    this.bot = bot;
    this.commandMap = new Map<string, CommandBase>();
    this.aliasMap = new Map<string, string>();

    // Add any commands to be processed here...
    this.addCommand(new PingCommand());
    this.addCommand(new InfoCommand());
    this.addCommand(new ColorCommand());
    this.addCommand(new HelpCommand());
    this.addCommand(new ResendRolesCommands(bot));

    this.bot.client.on('message', (message: Message) => {
      this.sendCommand(message);
    })
  }

  private async sendCommand(message: Message) {
    if (message.author.id !== this.bot.client.user.id) {
      const prefixLength = this.bot.config.settings.prefix.length;
      const compValue = message.cleanContent.slice(0, prefixLength);
      if (compValue === this.bot.config.settings.prefix) {
        if (await this.canUserSend(message) && await this.isAllowedChannel(message)) {
          this.processMessage(message);
        }
      }
    }
  }

  private async canUserSend(message: Message): Promise<boolean> {
    // TODO add disallowed users in settings
    return true;
  }

  private async isAllowedChannel(message: Message): Promise<boolean> {
    let allowed = false;
    const commandChannels = this.bot.config.settings.allowedCommandChannels as string[];
    const allowedInDMs = this.bot.config.settings.allowCommandsInDMs as boolean;
    logCmd(message.channel.type);
    if (allowedInDMs && message.channel.type === "dm") {
      allowed = true;
    } else if (commandChannels.includes(message.channel.id)) {
      allowed = true;
    } else {
      const txtChannel = message.channel as TextChannel;
      if (txtChannel !== undefined && txtChannel.name !== undefined) {
        const msg = await message.author.send("Sorry- you cannot use commands in " + txtChannel.name) as Message;
        msg.delete(10000);
      } else {
        const msg = await message.author.send("Sorry, you can't send commands here") as Message;
        msg.delete(10000);
      }
    }
    return allowed;
  }

  private async processMessage(message: Message) {
    const prefixLength = this.bot.config.settings.prefix.length;
    let messageContent = message.cleanContent.slice(prefixLength);
    messageContent = messageContent.trim();
    logCmd(messageContent);
    const parts = messageContent.split(" ");
    let commandSuccess = false;
    if (parts.length > 0) {
      let cmdName = parts[0].toLowerCase();

      // Check for aliases
      const aliasName = this.aliasMap.get("cmdName");
      if (aliasName !== undefined) {
        cmdName = aliasName;
      }

      const command = this.commandMap.get(cmdName);
      if (command !== undefined) {
        commandSuccess = command.handleCommand(message, cmdName, parts.splice(1));
        logCmd("Triggered command %s with result %s", command, commandSuccess);
      } else {
        logError("Failed to get command for name " + cmdName);
        message.react("❗");
        const response = await message.channel.send("Failed to find command");
        if (response !== undefined) {
          setTimeout((msg: Message) => {
            msg.delete();
          }, 10000, response);
        }
      }
    }

    return commandSuccess;
  }

  private addCommand(base: CommandBase) {
    // Add command to the map
    this.commandMap.set(base.name, base);

    const aliasList = this.aliases[base.name];
    let aliasString = 'none';
    if (aliasList !== undefined) {
      aliasString = aliasList.join(', ');
      for (const alias of aliasList) {
        this.aliasMap.set(alias, base.name);
      }
    }

    logCmd("Added command " + base.name + " with aliases " + aliasString);
  }

}
