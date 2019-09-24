'use strict'

import { Client, Message } from 'discord.js'
import * as debug from 'debug'

import * as YAML from 'yamljs'
import { CommandProcessor } from './commands/CommandProcessor';
import { StatusUpdater } from './utilities/StatusUpdater';
import { ReactionProcessor } from './reactionHandlers/ReactionProcessor';
import { SheepData as SheepData } from './data/SheepData'

// DEBUG PREPARE
// ----------------------------------------------------------------------------
export const logSystem = debug('bot:system')
export const logEvent = debug('bot:event')
export const logError = debug('bot:error')
export const logWarn = debug('bot:warn')

export class SheepBot {
  public client: Client;

  public data: SheepData;

  public commands: CommandProcessor;
  public reactions: ReactionProcessor;
  public status: StatusUpdater;

  constructor() {
    this.data = new SheepData();
    this.client = new Client();
    this.commands = new CommandProcessor(this);
    this.reactions = new ReactionProcessor(this);
    this.status = new StatusUpdater(this);
  }

  public start(): void {
    logSystem('Starting bot...');

    // => Bot is ready...
    this.client.on('ready', () => {
      logEvent(`[${this.data.config.settings.nameBot}] Connected.`);
      logEvent(`Logged in as ${this.client.user.tag}`);
    })

    // => Bot error and warn handler
    this.client.on('error', logError);
    this.client.on('warn', logWarn);

    // => Process handler
    process.on('exit', () => {
      logEvent(`[${this.data.config.settings.nameBot}] Process exit.`);
      this.client.destroy();
    })
    process.on('uncaughtException', (err: Error) => {
      const errorMsg = (err ? err.stack || err : '').toString().replace(new RegExp(`${__dirname}\/`, 'g'), './')
      logError(errorMsg)
    })
    process.on('unhandledRejection', (err: Error) => {
      logError('Uncaught Promise error: \n' + err.stack)
    })

    // => Login
    this.client.login(this.data.config.settings.token)
  }
}
