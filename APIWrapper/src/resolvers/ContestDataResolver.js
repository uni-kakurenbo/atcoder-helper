"use strict";

const { Routes } = require("../session/Addresses");
const { CachedDataResolver } = require("./CachedDataResolver");

class ContestDataResolver extends CachedDataResolver {
  constructor(contests) {
    super(contests.client);

    this.contests = contests;
  }
  async fromId(id, { cache = true, force = false } = {}) {
    if (!force) {
      const existing = this._find(id);
      if (existing) return existing;
    }
    const found = this._find(id, { source: await this.fetch({ cache }) });
    if (found) return found;
    return this.contests.scraper.fromId(id, { cache });
  }

  async fetch({ cache } = {}) {
    const response = await this.client.gateway.get(Routes.API.Problems.contests);
    return this._modify(response?.data, { cache });
  }
}

module.exports = { ContestDataResolver };
