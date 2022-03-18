"use strict";

const { Base } = require("./Base");
const { ContestProblemManager } = require("../managers/ContestProblemManager");

const { Routes } = require("../session/Addresses");

class Contest extends Base {
  constructor(client, data) {
    super(client);

    this.id = data.id?.toLowerCase();
    this.problems = new ContestProblemManager(this);

    this._patch(data);
  }

  _patch(data) {
    const assign = this._makeAssigner(data);

    assign(["startsAt", "start_epoch_second"], new Date(data.start_epoch_second));
    assign(["duration", "duration_second"]);
    assign("title");
    assign(["ratedRange", "rate_change"]);
    assign(["ratedRange", "rate_change"]);

    return this;
  }

  fetch(force = true) {
    return this.client.contests.fetch(this.id, { force });
  }

  get url() {
    return Routes.Web.contest(this.id);
  }

  toString() {
    return `[${this.title}](${this.url}})`;
  }
}

module.exports = { Contest };
