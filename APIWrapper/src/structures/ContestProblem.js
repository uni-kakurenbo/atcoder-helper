"use strict";

const { AtCoderStructure } = require("./AtCoderStructure");

const { ContestProblemSampleManager } = require("../managers/ContestProblemSampleManager");
const { ContestProblemSubmitter } = require("../submitters/ContestProblemSubmitter");

const { Routes } = require("../session/Addresses");

class ContestProblem extends AtCoderStructure {
  constructor(client, data, contest) {
    super(client);

    this.id = data.id;

    this.contest = contest;

    this.samples = new ContestProblemSampleManager(this);
    this.submitter = new ContestProblemSubmitter(this);

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

  async submit(...options) {
    return this.submitter.submit(...options);
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
