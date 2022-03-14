"use strict";

const { CachedManager } = require("./CachedManager");
const { UserStatisticsData } = require("../structures/UserStatisticsData");

class UserStatisticsDataManager extends CachedManager {
  constructor(user, iterable) {
    super(user.client, UserStatisticsData, iterable);
    this.user = user;
  }
  _add(data, cache = true) {
    super._add(data, cache, { extras: [this.user] });
  }
}

module.exports = { UserStatisticsDataManager };
