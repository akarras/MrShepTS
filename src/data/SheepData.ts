import YAML = require("yamljs");
import * as path from 'path'
import debug = require("debug");
import fs = require('fs');
import { IRoleData } from "../dataTypes/role";

const data = debug('bot:sheepData');

export class SheepData {
  public config: any;
  public roles: IRoleData[];
  constructor() {
    this.config = YAML.load(path.resolve(__dirname, '../config/settings.yml'));
    this.roles = YAML.load(path.resolve(__dirname, '../config/roles.yml')).roles;
    data('loaded configs');
    data(this.config);
    data(this.roles);
  }

  // Saves changes to the roles config back to the YAML
  public resaveRoles() {
    const yamlStr = YAML.stringify(this.roles);
      fs.writeFile(path.resolve(__dirname, '../config/roles.yml'), yamlStr, (err) => {
      data("Failed writing roles");
    });
    // TODO, upload back to git?
  }
}
