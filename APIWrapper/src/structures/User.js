"use strict";

const { UserStatisticsDataManager } = require("../managers/UserStatisticsDataManager");
const { Base } = require("./Base");
const {
  UserAcceptedCount,
  UserRatedPointSum,
  UserLongestStreakCount,
} = require("./UserStatisticsCounters");
const { UserStatus } = require("./UserStatus");

class User extends Base {
  constructor(client, data) {
    super(client);

    this.username = data.username;

    this.statistics = new UserStatisticsDataManager(this);

    this._patch(data);
  }

  _patch(data) {
    const assign = this._makeAssigner(data);

    assign("status", new UserStatus(this, data.status));

    this.statistics._add(new UserAcceptedCount(this, { id: "acceptedCount" }));
    this.statistics._add(new UserRatedPointSum(this, { id: "ratedPointSum" }));
    this.statistics._add(new UserLongestStreakCount(this, { id: "longestStreakCount" }));

    return this;
  }

  async exists() {
    return this.client.users.exists(this.username);
  }

  fetch(force = true) {
    return this.client.users.fetch(this.username, { force });
  }

  toString() {
    return `@${this.username}`;
  }
}

module.exports = { User };
