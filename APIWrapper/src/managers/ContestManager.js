"use strict";

const { CachedManager } = require("./CachedManager");
const { Contest } = require("../structures/Contest");

const { Routes } = require("../session/Addresses");

class ContestManager extends CachedManager {
  constructor(client, iterable) {
    super(client, Contest, iterable);
  }

  async fetch(contest, { cache = true, force = false } = {}) {
    const id = this.resolveId(contest)?.toLowerCase();
    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    const response = await this.client.adapter.get(Routes.API.Problems.contests);
    const contests = response?.data;
    const matched = contests.find(({ id: _id }) => _id?.toLowerCase() === id);

    if (!matched) return null;
    return this._add(matched, cache);
  }

  async fetchAll(cache) {
    const response = await this.client.adapter.get(Routes.API.Problems.contests);
    const contests = response?.data;
    contests?.forEach((_contest) => this._add(_contest, cache));
    return this.cache;
  }

  async exists(id) {
    const userPageResponse = await this.client.adapter.get(Routes.Web.contest(id));

    return userPageResponse?.response?.status !== 404;
  }
}

module.exports = { ContestManager };
