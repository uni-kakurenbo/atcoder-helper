"use strict";

const CommandSystems = require("./command");
const PageControllers = require("./PageController.js");

const Database = {
  ...require("./DatabaseManager.js"),
  ...require("./DatabaseAccessor"),
};

const API = require("./API.js");
const Logger = require("./Logger.js");
const ApplicationErrors = require("./ApplicationError.js");

const errors = require("./errors.js");

module.exports = {
  API,
  Logger,
  errors,
  Database,
  ...CommandSystems,
  ...PageControllers,
  ...ApplicationErrors,
};
