"use strict";

const { Routes } = require("../session/Addresses");

const { CachedManager } = require("./CachedManager");
const { ContestProblem } = require("../structures/ContestProblem");

class ContestProblemManager extends CachedManager {
  constructor(contest, iterable) {
    super(contest.client, ContestProblem, iterable);

    this.contest = contest;
  }

  async fetch(problem, { cache = true, force = false, all = true } = {}) {
    if (all) await this.fetchAll({ cache, force });

    const id = this.resolveId(problem)?.toLowerCase();
    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    const response = await this.client.adapter.get(Routes.API.Problems.problems);
    const problems = response?.data;
    const matched = problems.find(({ id: _id }) => _id.toLowerCase() === id);

    if (!matched) return null;
    return this._add(matched, cache, { extras: [this.contest] });
  }

  async fetchAll({ cache = true, force = false } = {}) {
    const response = await this.client.adapter.get(Routes.API.Problems.problems);
    const problems = response?.data;
    problems.forEach((_problem) => {
      if (_problem.contest_id?.toLowerCase() !== this.contest.id) return;
      if (!force && this.cache.has(_problem.id)) return;
      this._add(_problem, cache, { extras: [this.contest] });
    });

    return this.cache;
  }

  async exists(id) {
    const userPageResponse = await this.client.adapter.get(Routes.Web.problem(id));
    return userPageResponse?.response?.status !== 404;
  }
}

module.exports = { ContestProblemManager };
