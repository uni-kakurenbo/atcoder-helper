"use strict";

const { Cache } = require("../Cache");
const { DataScraper } = require("./DataScraper");
const { HttpResponseBody } = require("../structures/HttpResponseBody");
const { HttpResponseResolver } = require("../resolvers/HttpResponseResolver");

class CachedDataScraper extends DataScraper {
  #isCacheLocked = false;
  #cache = new Cache();

  constructor(client) {
    super(client);
    this.resolver = new HttpResponseResolver(this);
  }

  _with(cache) {
    if (!this.#isCacheLocked && cache instanceof Cache) {
      this.#cache = cache;
      this.#isCacheLocked = true;
    } else {
      throw new Error();
    }
  }

  get cache() {
    return this.#cache;
  }

  async _fetch(url, { cache = true, force = false, fetchOptions } = {}) {
    if (!force) {
      const existing = this.cache.get(url);
      if (existing) return existing;
    }
    return this._add(await this.client.adapter.get(url, fetchOptions), cache) ?? null;
  }

  _add(response, cache = true, { url } = {}) {
    const resolvedUrl = this.resolver.resolveUrl(response, url);

    /*
    const existing = this.cache.get(resolvedUrl);
    if (existing) {
      if (cache) {
        existing._patch(response.data);
        return existing;
      }
      const clone = existing._clone();
      clone._patch(response.data);
      return clone;
    }
    */

    const entry = new HttpResponseBody(resolvedUrl, response.data);

    if (cache) this.cache.set(url ?? entry.url, entry);
    return entry;
  }
}

module.exports = { CachedDataScraper };
