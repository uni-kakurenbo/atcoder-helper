"use strict";

const { Collection, Util } = require("discord.js");
const { inlineCode, codeBlock } = require("@discordjs/builders");

const Logger = require("./Logger.js");

const ExtensibleCustomError = require("extensible-custom-error");

class ApplicationError extends ExtensibleCustomError {
  type = "RuntimeError";
  async log() {
    console.setColor("red").log(this.stack);
    return Logger.log(Logger.Type.ERROR, { error: this });
  }
  toCollection() {
    return new Collection([Symbol(this.stack)]);
  }
}

class ProcessError extends ApplicationError {
  constructor(_error, _origin) {
    super(_error);
    this.origin = _origin;
  }
}

class DatabaseError extends ApplicationError {}

class BaseSecondaryError extends ApplicationError {
  toCollection() {
    const collection = new Collection();
    collection.set(this.type, codeBlock("js", this.stack));
    if (this.command) collection.set("Command", inlineCode(this.command.data.name));
    return collection;
  }
}

class SystemError extends BaseSecondaryError {}

class CommandError extends BaseSecondaryError {
  constructor(_message, _error, _command) {
    super(_message, _error);
    this.command = _command;
  }
}

module.exports = { ApplicationError, ProcessError, SystemError, CommandError, DatabaseError };
