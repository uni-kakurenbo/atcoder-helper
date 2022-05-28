"use strict";

const { Routes } = require("../session/Addresses");
const { CachedDataResolver } = require("./CachedDataResolver");

class ContestProblemDataResolver extends CachedDataResolver {
  async fromId(id, { force, cache } = {}) {
    if (!force) {
      const existing = this._find(id);
      if (existing) return existing;
    }
    return this._find(id, { source: await this.fetch({ cache }) });
  }

  async fetch({ cache } = {}) {
    const response = await this.client.gateway.get(Routes.API.Problems.problems);
    return this._modify(response?.data, { cache });
  }
}

module.exports = { ContestProblemDataResolver };
