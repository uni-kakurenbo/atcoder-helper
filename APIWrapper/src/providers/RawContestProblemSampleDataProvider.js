"use strict";

const { RawDataProvider } = require("./RawDataProvider");

class RawContestProblemSampleDataProvider extends RawDataProvider {
  constructor(samples) {
    super(samples.client);

    this.samples = samples;
  }

  async fromId(id, { cache = true, force = false, all = true } = {}) {
    return this.samples.scraper.load(id, { cache, all });
  }
}

module.exports = { RawContestProblemSampleDataProvider };
