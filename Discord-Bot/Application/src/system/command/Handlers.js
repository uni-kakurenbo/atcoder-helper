"use strict";

const { setTimeout } = require("node:timers");
const { setTimeout: sleep } = require("node:timers/promises");

const { Collection } = require("discord.js");
const { client } = require("../../config.js");

const Logger = require("../Logger.js");
const { CommandError } = require("../ApplicationError.js");

const { SlashCommand } = require("./Definitions.js");

class BaseCommandHandler {
  constructor() {
    this.commands = new Collection();
  }
  generateHelp() {
    return new CommandHelp(
      this.commands.map((_command, _name) => new CommandInfomation(_name, _command.data))
    );
  }
}

class ApplicationCommandHandler extends BaseCommandHandler {
  constructor(_commands = []) {
    super();
    this.addCommands(_commands);
    //実行&応答
    client.on("interactionCreate", async (_interaction) => {
      if (!this.constructor?.isMatchedType(_interaction)) return; //Defined in the extended class.
      const calledCommand = this.commands.get(_interaction.commandName);
      if (!calledCommand) return;
      const options = _interaction.options.data ?? [];
      //console.log(options)
      let interactionArguments,
        subCommandName = "";
      switch (options[0]?.type) {
        case "SUB_COMMAND":
          {
            //console.log(options)
            subCommandName = options[0].name;
            interactionArguments = options[0].options ?? [];
          }
          break;
        case "SUB_COMMAND_GROUP":
          {
            //Develop on demand.
          }
          break;
        default: {
          interactionArguments = options;
        }
      }
      //console.log(interactionArguments)
      let argumentsData;
      if (calledCommand.data.argumentTypes === SlashCommand.ArgumentType.OBJECT) {
        argumentsData = {};
        interactionArguments.forEach((_argument) => {
          argumentsData[_argument.name] = _argument.value;
        });
        argumentsData = [argumentsData];
      } else {
        argumentsData = interactionArguments.map((_argument) => _argument.value);
      }
      //console.log(this.argumentTypes, _interaction.commandName)
      //console.log(_interaction)
      console.setColor("cyan").log("Called:", calledCommand.data.name, argumentsData);

      let firstResponse = true;
      let deferring = false,
        deferred = false;
      let timeout = false;
      const deferTimer = setTimeout(async () => {
        deferring = true;
        await _interaction.deferReply({ ephemeral: calledCommand.data.ephemeral });
        deferred = true;
      }, 1500);
      //console.log(calledCommand.data.timeout);
      const timeLimiter = setTimeout(async () => {
        const timeoutMessage = {
          content: `_Timed out_`,
          ephemeral: true,
        };
        if (deferred) {
          clearTimeout(deferTimer);
          await _interaction.followUp(timeoutMessage);
          deferred = false;
        } else {
          await _interaction.reply(timeoutMessage);
        }
        timeout = true;
      }, calledCommand.data.timeout);

      const run = calledCommand.run(argumentsData, _interaction, subCommandName);
      /*try {
        run =
      } catch(error) {
        console.log("Error:", error);
      }*/
      //let results = await run.next();
      let results,
        message = null;
      do {
        try {
          results = await run.next(message);
        } catch (_e) {
          clearTimeout(timeLimiter);
          clearTimeout(deferTimer);
          const errorId = (await new CommandError("UnexpectedError", _e, calledCommand).log())[0]
            .id;
          console.setColor("yellow").log(errorId);
          const errorMessage = {
            content: `予期せぬエラーが発生しました。\nエラーID：\`${errorId}\``,
            ephemeral: true,
          };
          if (deferred) {
            clearTimeout(deferTimer);
            await _interaction.followUp(errorMessage);
          } else {
            await _interaction.reply(errorMessage);
          }
          return;
        }

        if (timeout) return;

        let value = results.value;
        if (typeof value === "string") value = { content: value };
        //console.log("done:", results)
        if (firstResponse) {
          clearTimeout(timeLimiter);
          if (deferring) {
            while (!deferred) await sleep(100);
            message = await _interaction.followUp(value);
          } else {
            clearTimeout(deferTimer);
            message = await _interaction.reply({
              ...value,
              fetchReply: true,
              ephemeral: calledCommand.data.ephemeral,
            });
          }
          firstResponse = false;
        } else {
          if (value?.edit) {
            message = await _interaction.editReply(value?.message);
          } else {
            if (value) message = await _interaction.followUp(value);
          }
        }
      } while (!results.done && !timeout);
      console.setColor("green").log("Command Success");
    });
  }

  addCommands(_commands) {
    _commands.forEach((_command) => {
      let _commandName = _command.name;
      this.commands.set(_commandName, {
        data: _command,
        run(_arguments, _from, _subCommand) {
          let commandName = _from.commandName;
          if (_subCommand) commandName += "." + _subCommand;

          const argumentsString =
            _command.argumentTypes === SlashCommand.ArgumentType.OBJECT
              ? JSON.stringify(_arguments)
              : _arguments.map((_arg) => `"${String(_arg)}"`).join(",");
          Logger.log(Logger.Type.COMMAND, {
            command: _command.name,
            message: {
              content: `ApplicationCommand[${commandName}(${argumentsString})]`,
              author: _from.member.user,
              channel: client.channels.cache.get(_from.channelId),
              guild: _from.guild,
              id: _from.id,
            },
          });
          return _command.run(_arguments, { from: _from, subCommand: _subCommand });
        },
      });
    });
  }

  async register() {
    const postCommands_promise = this.commands.map((_command) => {
      //console.log(_command.slashCommands.data);
      return _command.data.postCommand();
    });
    return Promise.allSettled(postCommands_promise);
  }
  async remove() {
    const deleteCommands_promise = this.commands.map((_command) => {
      //console.log(_command.data);
      return _command.data.deleteCommand();
    });
    return Promise.allSettled(deleteCommands_promise);
  }
}

class SlashCommandHandler extends ApplicationCommandHandler {
  static isMatchedType(_interaction) {
    return _interaction.isCommand();
  }
}

class ContextMenuCommandHandler extends ApplicationCommandHandler {
  static isMatchedType(_interaction) {
    return _interaction.isContextMenu();
  }
}

class UserCommandHandler extends ContextMenuCommandHandler {}

class MessageCommandHandler extends ContextMenuCommandHandler {}

class PlainCommandHandler extends BaseCommandHandler {
  constructor(_commands = []) {
    super(_commands);
    this.addCommands(_commands);

    //実行&応答
    client.on("messageCreate", (_message) => {
      //console.log(this.commands)
      this.commands.forEach(async (_command) => {
        //console.log(_command)
        if (
          !_message.content.match(_command.regExp) ||
          _command.data.guildIds.indexOf(_message?.guild?.id) == -1
        )
          return;

        let _arguments = _message.content.replace(_command.regExp, "");
        //console.log(_command.data.options)
        if (_command.data.options.split) {
          _arguments = String(_arguments).trim().split(/\s+/);
        } else {
          _arguments = [_arguments];
        }
        //console.log(_arguments)
        const run = _command.run(_arguments, _message);
        let results;
        do {
          results = await run.next();
          _message.reply(results.value);
        } while (!results.done);
      });
    });
  }

  addCommands(_commands) {
    _commands.forEach((_command) => {
      let _commandName = _command.name;
      let _commandRegExpText = _commandName;
      if (_command.prefix) _commandRegExpText = _command.prefix + _commandName;
      this.commands.set(_commandName, {
        regExp: RegExp("^" + _commandRegExpText + " "),
        data: _command,
        run: (_arguments, _from) => {
          Logger.log(Logger.Type.COMMAND, { command: _command.name, message: _from });
          return _command.run(_arguments, _from);
        },
      });
    });
  }
}

module.exports = {
  BaseCommandHandler,
  SlashCommandHandler,
  UserCommandHandler,
  MessageCommandHandler,
  PlainCommandHandler,
};
