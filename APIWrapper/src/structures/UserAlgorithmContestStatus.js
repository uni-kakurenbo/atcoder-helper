"use strict";

const { UserContestStatus } = require("./UserContestStatus");

class UserAlgorithmContestStatus extends UserContestStatus {
  get rating() {
    return this.history.cache?.last()?.newRating ?? -1;
  }
  get highestRating() {
    return this.history.cache.reduce((prev, current) => Math.max(prev, current?.newRating ?? 0), -1);
  }
}

module.exports = { UserAlgorithmContestStatus };
