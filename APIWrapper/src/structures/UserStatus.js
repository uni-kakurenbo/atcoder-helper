"use strict";

const { Base } = require("./Base");
const { UserAlgorithmContestStatus } = require("./UserAlgorithmContestStatus");
const { UserHeuristicContestStatus } = require("./UserHeuristicContestStatus");

class UserStatus extends Base {
  constructor(user, data) {
    super(user.client);

    this._patch(data);
  }

  _patch(data) {
    const assign = this._makeAssigner(data);

    assign("algorithm", new UserAlgorithmContestStatus(this, data.algorithm));
    assign("heuristic", new UserHeuristicContestStatus(this, data.heuristic));

    return this;
  }
}

module.exports = { UserStatus };
