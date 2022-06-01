"use strict";

const { AtCoderStructure } = require("./AtCoderStructure");

class UserContestRecord extends AtCoderStructure {
  constructor(client, data, user) {
    super(client);

    this.user = user;

    this.id = data.ContestScreenName;

    this._patch(data);
  }

  _patch(data) {
    const assign = this._makeAssigner(data);

    assign(["isRated", "IsRated"]);
    assign(["place", "Place"]);
    assign(["oldRating", "OldRating"]);
    assign(["newRating", "NewRating"]);
    assign(["performance", "Performance"]);
    assign(["innerPerformance", "InnerPerformance"]);
    assign(["name", "ContestName"]);
    assign(["name_en", "ContestNameEn"]);
    assign(["endedAt", "EndTime"], new Date(data.EndTime));

    return this;
  }
}

module.exports = { UserContestRecord };
