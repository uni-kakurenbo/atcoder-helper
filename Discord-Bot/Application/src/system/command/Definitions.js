"use strict";

const { SlashCommandBuilder, ContextMenuCommandBuilder } = require("@discordjs/builders");
const { client } = require("../../config.js");

const RegistrationType = {
  GUILD: Symbol("Guild"),
  GLOBAL: Symbol("Global"),
};
const makeBaseCommand = (Base) => {
  return class BaseCommand extends Base {
    constructor(_definition) {
      super();
      Object.defineProperty(this, "name", { value: _definition.name });
      if (_definition.description) this.description = _definition.description;
      this.execute = _definition.execute;
      this.registrationType = _definition.type; // global or guild

      if (this.registrationType === BaseCommand.RegistrationType.GUILD) {
        this.guildIds =
          _definition.guildIds?.filter((_guildId) => client.guilds.cache.has(_guildId)) ??
          new Array(1).fill();
      } else if (this.registrationType === BaseCommand.RegistrationType.GLOBAL) {
        this.guildIds = [null];
      } else {
        console.log(this.registrationType);
        throw new Error("Invalid command's type");
      }
    }

    async *run(_arguments, _message) {
      let execute = this.execute;
      if (typeof execute === "function") execute = await execute.bind(_message)(..._arguments);
      execute ??= "_Command Not Found_";
      if (typeof execute === "string") execute = [execute];
      if (typeof (execute[Symbol.iterator] ?? execute[Symbol.asyncIterator]) === "function") {
        return yield* execute;
      } else {
        return execute;
      }
    }

    static RegistrationType = RegistrationType;
  };
};

const makeApplicationCommand = (Base) => {
  return class ApplicationCommand extends makeBaseCommand(Base) {
    constructor(_definition = {}) {
      super(_definition);
      //console.log(this.type);
      this.id = {};
      this.timeout = _definition.timeout ?? 15 * 1000;
      this.defaultPermission = _definition.defaultPermission ?? true;
      this.ephemeral = _definition.ephemeral ?? false;
      this.setPermissions = _definition.setPermissions;
      //console.log(this.ephemeral)
      this.argumentTypes = _definition.argumentTypes;
    }

    static async #getApplicationCommandManager(_type, _commandId, _guildId = null) {
      if (!_commandId) throw new Error("Invalid command's Id");
      switch (_type) {
        case ApplicationCommand.RegistrationType.GUILD:
          return client.guilds.cache.get(_guildId).commands;
          break;
        case ApplicationCommand.RegistrationType.GLOBAL:
          return client.application.commands;
          break;
        default:
          throw new Error("Invalid command's type");
      }
    }

    static async postCommandIdById(_guildId, _definition) {
      let guildId;
      switch (_definition.registrationType) {
        case ApplicationCommand.RegistrationType.GUILD:
          guildId = _guildId;
          break;
        case ApplicationCommand.RegistrationType.GLOBAL:
          guildId = null;
          break;
        default:
          throw new Error("Invalid command's type");
      }
      //console.log(_definition._registrationType, guildId)

      //console.log(_definition.type);
      const response = await client.application.commands
        .create(_definition, guildId)
        .catch((_response) => {
          throw _response;
        });

      if (_definition.setPermissions) {
        await response.permissions.set({
          permissions: await _definition.setPermissions(guildId),
        });
      }

      return response;
    }

    static async deleteCommandById(_registrationType, _commandId, _guildId = null) {
      const commands = await this.#getApplicationCommandManager(
        _registrationType,
        _commandId,
        _guildId
      ).catch((_response) => {
        throw _response;
      });
      //console.log(_registrationType, _commandId, _guildId)
      let command = await commands.fetch(_commandId).catch((_response) => {
        throw _response;
      });
      //console.log(command)
      await command.delete().catch((_response) => {
        throw _response;
      });
      //console.log(response)
      return command;
    }

    static async editCommandIdById(_registrationType, _commandId, _guildId = null, _definition) {
      const commands = await this.#getApplicationCommandManager(
        _registrationType,
        _commandId,
        _guildId
      ).catch((_response) => {
        throw _response;
      });
      //console.log(_registrationType, _commandId, _guildId)
      let command = await commands.fetch(_commandId).catch((_response) => {
        throw _response;
      });
      //console.log(command)
      await command.edit(_definition).catch((_response) => {
        throw _response;
      });

      if (_definition.setPermissions) {
        await command.permissions.set({
          permissions: await _definition.setPermissions(_guildId),
        });
      }

      //console.log(response)
      return command;
    }

    postCommand(_guildIds = this.guildIds) {
      //console.log(this._createEndpost(_guildIds))
      const postCommands_promise = _guildIds.map((_guildId) => {
        return new Promise((resolve, reject) => {
          ApplicationCommand.postCommandIdById(_guildId, this)
            .then(async (response) => {
              this.id[_guildId] = response.id;
              return resolve(response);
            })
            .catch((_error) => {
              return reject(_error);
            });
        });
      });
      //console.log(Promise.all(postCommands_promise))
      return Promise.all(postCommands_promise);
    }

    deleteCommand(_guildIds = this.guildIds) {
      const deleteCommands_promise = _guildIds.map((_guildId) => {
        return new Promise(async (resolve, reject) => {
          await ApplicationCommand.deleteCommandById(
            this.registrationType,
            this.id[_guildId],
            _guildId
          )
            .then((_response) => {
              return resolve(_response);
            })
            .catch((_error) => {
              return reject(_error);
            });
        });
      });
      return Promise.all(deleteCommands_promise);
    }

    editCommand(_guildIds = this.guildIds) {
      const deleteCommands_promise = _guildIds.map((_guildId) => {
        return new Promise(async (resolve, reject) => {
          await ApplicationCommand.editCommandIdById(
            this.registrationType,
            this.id[_guildId],
            _guildId,
            this
          )
            .then((_response) => {
              return resolve(_response);
            })
            .catch((_error) => {
              return reject(_error);
            });
        });
      });
      return Promise.all(deleteCommands_promise);
    }
  };
};

class SlashCommand extends makeApplicationCommand(SlashCommandBuilder) {
  type = "CHAT_INPUT";
  constructor(_definition) {
    super(_definition);
  }
  static ArgumentType = {
    ARRAY: Symbol("Array"),
    OBJECT: Symbol("Object"),
  };
}

class ContextMenuCommand extends makeApplicationCommand(ContextMenuCommandBuilder) {}

class UserCommand extends ContextMenuCommand {
  type = "USER";
}

class MessageCommand extends ContextMenuCommand {
  type = "MESSAGE";
}

class PlainCommand extends makeBaseCommand(SlashCommandBuilder) {
  options = {};
  constructor(_definition) {
    super(_definition);
    this.prefix = _definition.prefix;
    Object.assign(this.options, _definition.options);
    if (this.options?.split !== false) this.options = { split: true };
  }
}

module.exports = {
  SlashCommand,
  UserCommand,
  MessageCommand,
  PlainCommand,
};
