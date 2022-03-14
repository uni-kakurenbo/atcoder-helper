"use strict";

const { Routes } = require("../session/Addresses");
const { Base } = require("./Base");

class UserStatistics extends Base {
  constructor(user, data) {
    super(user.client);

    Object.defineProperty(this, "user", user);

    this._patch(data);
  }

  _patch(data) {
    const assign = this._makeAssigner(data);

    assign("acceptedCount");
    assign("ratedPointSum");
    assign("longestStreakCount");

    return this;
  }
}

module.exports = { UserStatistics };
