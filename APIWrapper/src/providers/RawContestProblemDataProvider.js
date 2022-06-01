"use strict";

const { Routes } = require("../session/Addresses");
const { CachedRawDataProvider } = require("./CachedRawDataProvider");

class RawContestProblemDataProvider extends CachedRawDataProvider {
  constructor(problems) {
    super(problems.client);

    this.problems = problems;
  }
  async fromId(id, { cache = true, force = false, all = true } = {}) {
    if (!force) {
      const existing = this._find(id);
      if (existing) return existing;
    }
    const found = this._find(id, { source: await this.fetch({ cache: all }) });
    if (found) return found;
    return this.problems.scraper.load(id, { cache, force });
  }

  async fetch({ cache } = {}) {
    const response = await this.client.adapter.get(Routes.API.Problems.problems);
    return this._modify(response?.data, { cache });
  }
}

module.exports = { RawContestProblemDataProvider };
