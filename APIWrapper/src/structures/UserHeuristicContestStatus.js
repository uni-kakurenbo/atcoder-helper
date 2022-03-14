"use strict";

const { UserContestStatus } = require("./UserContestStatus");

class UserHeuristicContestStatus extends UserContestStatus {
  get rating() {
    return this.history.cache?.last()?.newRating ?? -1;
  }
}

module.exports = { UserHeuristicContestStatus };
