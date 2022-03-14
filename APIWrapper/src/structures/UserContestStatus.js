"use strict";

const { Base } = require("./Base");
const { UserContestRecordManager } = require("../managers/UserContestRecordManager");

class UserContestStatus extends Base {
  constructor(user, data) {
    super(user.client);

    this.history = new UserContestRecordManager(this);

    this._patch(data);
  }

  _patch(data) {
    if (data.history) {
      this.history.cache.clear();
      for (const useContest of data.history) this.history._add(useContest);
    }
  }

  get rating() {
    throw Error("NOT_IMPLEMENTED", "get rating", this.constructor.name);
  }
}

module.exports = { UserContestStatus };
