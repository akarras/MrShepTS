'use strict'

import { Client, Message } from 'discord.js'
import * as debug from 'debug'
import * as path from 'path'
import * as YAML from 'yamljs'
import { CommandProcessor } from './commands/CommandProcessor';
import { StatusUpdater } from './utilities/StatusUpdater';
import { ReactionProcessor } from './reactionHandlers/ReactionProcessor';

// DEBUG PREPARE
// ----------------------------------------------------------------------------
export const logSystem = debug('bot:system')
export const logEvent = debug('bot:event')
export const logError = debug('bot:error')
export const logWarn = debug('bot:warn')

export class SheepBot {

  public client: Client;
  public config: any;
  public commands: CommandProcessor;
  public reactions: ReactionProcessor;
  public status: StatusUpdater;

  constructor() {
    this.client = new Client()
    this.config = YAML.load(path.resolve(__dirname, './config/settings.yml'))
    this.commands = new CommandProcessor(this);
    this.reactions = new ReactionProcessor(this);
    this.status = new StatusUpdater(this);
  }

  public start(): void {
    logSystem('Starting bot...');

    // => Bot is ready...
    this.client.on('ready', () => {
      logEvent(`[${this.config.settings.nameBot}] Connected.`)
      logEvent(`Logged in as ${this.client.user.tag}`)
    })

    // => Bot error and warn handler
    this.client.on('error', logError)
    this.client.on('warn', logWarn)

    // => Process handler
    process.on('exit', () => {
      logEvent(`[${this.config.settings.nameBot}] Process exit.`)
      this.client.destroy()
    })
    process.on('uncaughtException', (err: Error) => {
      const errorMsg = (err ? err.stack || err : '').toString().replace(new RegExp(`${__dirname}\/`, 'g'), './')
      logError(errorMsg)
    })
    process.on('unhandledRejection', (err: Error) => {
      logError('Uncaught Promise error: \n' + err.stack)
    })

    // => Login
    this.client.login(this.config.settings.token)
  }
}
