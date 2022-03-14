"use strict";

const Definications = require("./Definitions.js");
const Handlers = require("./Handlers.js");
const Manager = require("./Manager.js");
const CommandController = require("./Controller.js");

module.exports = {
  ...Definications,
  ...Handlers,
  ...Manager,
  ...CommandController,
};
