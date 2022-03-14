"use strict";

const { CommandManager } = require("./Manager.js");

class CommandController extends CommandManager {
  createInfomationList() {
    return this.Slash.generateHelp().concat(this.Message.generateHelp());
  }
  generateHelpEmbed(_options) {
    //console.log(this.Slash.generateHelp())
    return this.Slash.generateHelp().toEmbeds(_options);
  }
}

module.exports = { CommandController };
