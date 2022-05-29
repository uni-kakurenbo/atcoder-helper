"use strict";

class BaseScraper {
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
  }
}

module.exports = { BaseScraper };
