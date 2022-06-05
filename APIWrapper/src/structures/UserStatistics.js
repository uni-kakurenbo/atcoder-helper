"use strict";

class UserStatistics extends AtCoderStructure {
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
