"use strict";

const { Routes } = require("../session/Addresses");
const { Base } = require("./Base");

class ContestProblemSample extends Base {
  constructor(client, data, contestProblem) {
    super(client);

    this.id = data.id;
    this.problem = contestProblem;

    this._patch(data);
  }

  _patch(data) {
    const assign = this._makeAssigner(data);

    assign("in");
    assign("out");

    return this;
  }

  fetch(force = true) {
    return this.problems.samples.fetch(this.id, { force });
  }
}

module.exports = { ContestProblemSample };
