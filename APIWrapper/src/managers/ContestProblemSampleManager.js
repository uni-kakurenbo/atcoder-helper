"use strict";

const { CachedManager } = require("./CachedManager");
const { ContestProblemSample } = require("../structures/ContestProblemSample");

const { Routes } = require("../session/Addresses");

class ContestProblemSampleManager extends CachedManager {
  constructor(contestProblem, iterable) {
    super(contestProblem.client, ContestProblemSample, iterable);

    this.problem = contestProblem;
  }

  async fetch(problem, { cache = true, force = false } = {}) {
    const id = this.resolveId(problem)?.toLowerCase();
    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    const problems = response?.data;
    const matched = problems.find(({ id: _id }) => _id.toLowerCase() === this.contest.id);

    if (!matched) return null;
    return this._add(matched, cache, { extras: [this.contest] });
  }

  async fetchAll(cache) {
    const response = await this.client.adapter.get(Routes.API.Problems.problems);
    const problems = response?.data;
    problems.forEach((_problem) => {
      if (_problem.contest_id?.toLowerCase() === this.contest.id) {
        this._add(_problem, cache, { extras: [this.contest] });
      }
    });

    return this.cache;
  }

  async exists(id) {
    const userPageResponse = await this.client.adapter.get(Routes.Web.problem(id));
    return userPageResponse?.response?.status !== 404;
  }
}

module.exports = { ContestProblemSampleManager };
