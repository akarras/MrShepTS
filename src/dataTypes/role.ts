import { ColorResolvable } from "discord.js";

export interface IRolesConfig {
  roles: IRoleData;
}

export interface IRoleData {
  name: string;
  messageId: string;
  roleId: string;
  emoji: string;
  color: ColorResolvable;
  description: string;
}
