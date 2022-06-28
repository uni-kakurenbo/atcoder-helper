"use strict";

const { BaseManager } = require("./BaseManager");
const { Error } = require("../errors");
const { BaseResolver } = require("../resolvers/BaseResolver");

class DataManager extends BaseManager {
  constructor(client, holds) {
    super(client);

    Object.defineProperty(this, "holds", { value: holds });

    this.resolver = new BaseResolver(this.holds, this);
  }

  get cache() {
    throw new Error("NOT_IMPLEMENTED", "get cache", this.constructor.name);
  }

  valueOf() {
    return this.cache;
  }
}

module.exports = { DataManager };
