"use strict";

const { RawDataProvider } = require("./RawDataProvider");

class CachedRawDataProvider extends RawDataProvider {
  #cache = [];
  constructor(client) {
    super(client);
  }

  get cache() {
    return this.#cache;
  }
  _modify(data, { cache = true } = {}) {
    if (Array.isArray(data)) {
      if (cache) this.#cache = data;
      return data;
    }
    return false;
  }
}

module.exports = { CachedRawDataProvider };
