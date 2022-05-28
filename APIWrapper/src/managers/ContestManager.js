"use strict";

const { JSDOM } = require("jsdom");

const { Routes } = require("../session/Addresses");

const { CachedManager } = require("./CachedManager");
const { Contest } = require("../structures/Contest");

const { ContestEventProvider } = require("../events/ContestEventProvider");
const { ContestDataResolver } = require("../resolvers/ContestDataResolver");

class ContestManager extends CachedManager {
  constructor(client, iterable) {
    super(client, Contest, iterable);

    this.events = new ContestEventProvider(this);
    this.resolver = new ContestDataResolver(this.client);
  }

  async fetch(contest, { cache = true, force = false, all = true } = {}) {
    const id = this.resolveId(contest)?.toLowerCase();

    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    return this._add(await this.resolver.fromId(id, { cache: all, force }), cache);
  }

  async fetchScheduled({ cache = true, force = false } = {}) {
    const response = await this.client.gateway.get(Routes.Web.home);
    const {
      window: { document },
    } = new JSDOM(response.data);
    const recentContests = document
      .querySelector("#contest-table-upcoming")
      .querySelector("tbody")
      .querySelectorAll("tr");
    recentContests.forEach((_content) => {
      const elements = _content.querySelectorAll("a");
      const contest = {
        id: elements[1].href.match(/contests\/(.+)/)[1],
        title: elements[1].textContent,
        start_epoch_second: elements[0].textContent, // Date String
      };
      if (!force && this.cache.has(contest.id)) return;
      this._add(contest, cache);
    });
    return this.cache;
  }

  async exists(id) {
    const userPageResponse = await this.client.gateway.get(Routes.Web.contest(id));

    return userPageResponse?.response?.status !== 404;
  }
}

module.exports = { ContestManager };
