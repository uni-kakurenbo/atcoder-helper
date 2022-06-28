"use strict";

const { JSDOM } = require("jsdom");

const { Routes } = require("../session/Addresses");

const { CachedManager } = require("./CachedManager");
const { Contest } = require("../structures/Contest");

const { ContestEventPublisher } = require("../events/ContestEventPublisher");
const { ContestDataScraper } = require("../scrapers/ContestDataScraper");
const { RawContestDataProvider } = require("../providers/RawContestDataProvider");

class ContestManager extends CachedManager {
  constructor(client, iterable) {
    super(client, Contest, iterable);

    this.events = new ContestEventPublisher(this);
    this.provider = new RawContestDataProvider(this);
    this.scraper = new ContestDataScraper(this);
  }

  async fetch(contest, { cache = true, force = false, all = true } = {}) {
    const id = this.resolver.resolveId(contest)?.toLowerCase();

    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    return this._add(await this.provider.fromId(id, { cache, force, all }), cache);
  }

  async fetchScheduled({ cache = true, force = false } = {}) {
    const response = await this.client.adapter.get(Routes.Web.contest());
    const {
      window: { document },
    } = new JSDOM(response.data);
    const recentContests = document.querySelectorAll("#contest-table-upcoming > tbody tr");
    recentContests.forEach((_content) => {
      const elements = _content.querySelectorAll("td");
      const duration = elements[2].textContent.split(":");
      const contest = {
        id: elements[1].querySelector("a").href.match(/contests\/(.+)/)[1],
        rate_change: elements[3].textContent,
        duration_second: duration[0] * 60 * 60 + duration[1] * 60,
        title: elements[1].querySelector("a").textContent,
        start_epoch_second: elements[0].textContent, // Date String
      };
      if (!force && this.cache.has(contest.id)) return;
      this._add(contest, cache);
    });
    return this.cache;
  }

  async exists(id) {
    const userPageResponse = await this.client.adapter.get(Routes.Web.contest(id));

    return userPageResponse?.response?.status !== 404;
  }
}

module.exports = { ContestManager };
