"use strict";

class BaseResolver {
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
  }
}

module.exports = { BaseResolver };
