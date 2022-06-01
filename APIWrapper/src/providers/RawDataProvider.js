"use strict";

const { BaseProvider } = require("./BaseProvider");

class RawDataProvider extends BaseProvider {
  get cache() {
    throw new Error("NOT_IMPLEMENTED", "get cache", this.constructor.name);
  }

  _find(id, { source = this.cache } = {}) {
    id = id.toLowerCase();
    return source.find(({ id: _id }) => _id?.toLowerCase() === id);
  }
}

module.exports = { RawDataProvider };
