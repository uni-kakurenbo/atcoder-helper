"use strict";

const { CachedManager } = require("./CachedManager");
const { UserContestRecord } = require("../structures/UserContestRecord");
const { Routes } = require("../session/Addresses");

class UserContestRecordManager extends CachedManager {
  constructor(user, iterable) {
    super(user.client, UserContestRecord, iterable);

    this.user = user;
  }

  async fetch(contest, { cache = true, force = false } = {}) {
    /*const contestName = this.resolver.resolveName(contest);
    if (!force) {
      const existing = this.cache.get(contestName);
      if (existing) return existing;
    }

    const response = await this.client.adapter.get(Routes.API.Problems.contests);

    return this._add(
      response.data.find((_contest) => _contest.id == contestName),
      cache
    );*/
  }
  _add(data, cache = true) {
    super._add(data, cache, { extras: [this.user] });
  }
}

module.exports = { UserContestRecordManager };
