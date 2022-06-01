"use strict";

const { Routes } = require("../session/Addresses");
const { CachedRawDataProvider } = require("./CachedRawDataProvider");

class RawContestDataProvider extends CachedRawDataProvider {
  constructor(contests) {
    super(contests.client);

    this.contests = contests;
  }
  async fromId(id, { cache = true, force = false, all = true } = {}) {
    if (!force) {
      const existing = this._find(id);
      if (existing) return existing;
    }
    const found = this._find(id, { source: await this.fetch({ cache: all }) });
    if (found) return found;
    return this.contests.scraper.load(id, { cache, force });
  }

  async fetch({ cache } = {}) {
    const response = await this.client.adapter.get(Routes.API.Problems.contests);
    return this._modify(response?.data, { cache });
  }
}

module.exports = { RawContestDataProvider };
