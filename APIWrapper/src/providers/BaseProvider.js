"use strict";

class BaseProvider {
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
  }
}

module.exports = { BaseProvider };
