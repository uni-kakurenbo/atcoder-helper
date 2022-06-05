"use strict";

const { CachedManager } = require("./CachedManager");
const { User } = require("../structures/User");

const { Routes } = require("../session/Addresses");

class UserManager extends CachedManager {
  constructor(client, iterable) {
    super(client, User, iterable);
  }

  async fetch(user, { cache = true, force = false } = {}) {
    const username = this.resolver.resolveName(user);
    if (!force) {
      const existing = this.cache.get(username);
      if (existing) return existing;
    }

    return this._add({ username, status: await this.client.fetchUserStatus(username) }, cache);
  }

  async exists(username) {
    const userPageResponse = await this.client.adapter.get(Routes.Web.user(username));
    return userPageResponse?.response?.status !== 404;
  }

  resolveName(nameOrInstance) {
    if (nameOrInstance instanceof User) return nameOrInstance.username;
    if (typeof nameOrInstance === "string") return nameOrInstance;
    return null;
  }
}

module.exports = { UserManager };
