"use strict";

const { SlashCommand, UserCommand, MessageCommand, PlainCommand } = require("./Definitions.js");

const {
  SlashCommandHandler,
  UserCommandHandler,
  MessageCommandHandler,
  PlainCommandHandler,
} = require("./Handlers.js");

class BaseCommandManager {
  constructor(_commands = []) {
    let slashCommands = [],
      userCommands = [],
      messageCommands = [],
      plainCommands = [];
    _commands.forEach((_command) => {
      this.#pushByClass(_command, slashCommands, userCommands, messageCommands, plainCommands);
    });
    this.Slash = new SlashCommandHandler(slashCommands);
    this.User = new UserCommandHandler(userCommands);
    this.Message = new MessageCommandHandler(messageCommands);
    this.Plain = new PlainCommandHandler(plainCommands);
  }

  addCommands(_commands = []) {
    let slashCommands = [],
      userCommands = [],
      messageCommands = [],
      plainCommands = [];

    _commands.forEach((_command) => {
      this.#pushByClass(_command, slashCommands, userCommands, messageCommands, plainCommands);
    });
    this.Slash.addCommands(slashCommands);
    this.User.addCommands(userCommands);
    this.Message.addCommands(messageCommands);
    this.Plain.addCommands(plainCommands);
  }
  addCommand(_command) {
    this.addCommands([_command]);
  }

  #pushByClass(_command, _slashCommands, _userCommands, _messageCommands, _plainCommands) {
    switch (_command.constructor) {
      case SlashCommand:
        _slashCommands.push(_command);
        break;
      case UserCommand:
        _userCommands.push(_command);
        break;
      case MessageCommand:
        _messageCommands.push(_command);
        break;
      case PlainCommand:
        _plainCommands.push(_command);
        break;
      default:
        throw new Error("Invalid class:" + String(_command.constructor));
    }
  }
}

class CommandManager extends BaseCommandManager {
  Application = {
    register: async () => {
      const responses = await Promise.allSettled([
        this.Slash.register(),
        this.User.register(),
        this.Message.register(),
      ]);
      return {
        slash: getContentToReturn(responses[0]),
        user: getContentToReturn(responses[1]),
        message: getContentToReturn(responses[2]),
      };
      function getContentToReturn(_response) {
        return _response.status === "fulfilled" ? _response.value : _response.reason;
      }
    },
    remove: async () => {
      const responses = await Promise.allSettled([
        this.Slash.remove(),
        this.User.remove(),
        this.Message.remove(),
      ]);
      return {
        slash: getContentToReturn(responses[0]),
        user: getContentToReturn(responses[1]),
        message: getContentToReturn(responses[2]),
      };
      function getContentToReturn(_response) {
        return _response.status === "fulfilled" ? _response.value : _response.reason;
      }
    },
  };
}

module.exports = {
  BaseCommandManager,
  CommandManager,
};
