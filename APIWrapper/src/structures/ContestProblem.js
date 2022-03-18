"use strict";

const { Routes } = require("../session/Addresses");
const { Base } = require("./Base");

class ContestProblem extends Base {
  constructor(client, data, contest) {
    super(client);

    this.id = data.id;
    this.contest = contest;

    this._patch(data);
  }

  _patch(data) {
    const assign = this._makeAssigner(data);

    assign(["contestId", "contest_id"]);
    assign("title");

    return this;
  }

  fetch(force = true) {
    return this.contest.problems.fetch(this.id, { force });
  }

  get url() {
    return Routes.Web.problem(this.contest?.id ?? this.contestId, this.id);
  }
  async exists() {
    return this.contest.problems.exists(this.id);
  }

  toString() {
    return `[${this.title}](${this.url}})`;
  }
}

module.exports = { ContestProblem };
