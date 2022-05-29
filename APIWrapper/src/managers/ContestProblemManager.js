"use strict";

const { Routes } = require("../session/Addresses");

const { CachedManager } = require("./CachedManager");
const { ContestProblem } = require("../structures/ContestProblem");
const { ContestProblemDataResolver } = require("../resolvers/ContestProblemDataResolver");
const { ContestProblemDataScraper } = require("../scrapers/ContestProblemDataScraper");

class ContestProblemManager extends CachedManager {
  constructor(contest, iterable) {
    super(contest.client, ContestProblem, iterable);

    this.contest = contest;
    this.resolver = new ContestProblemDataResolver(this);
    this.scraper = new ContestProblemDataScraper(this);
  }

  async fetch(problem, { cache = true, force = false, all = true } = {}) {
    const id = this.resolveId(problem)?.toLowerCase();
    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    return this._add(await this.resolver.fromId(id, { cache: all, force }), cache, { extras: [this.contest] });
  }

  async exists(id) {
    const userPageResponse = await this.client.gateway.get(Routes.Web.problem(id));
    return userPageResponse?.response?.status !== 404;
  }
}

module.exports = { ContestProblemManager };
