"use strict";

const { AtCoderStructure } = require("./AtCoderStructure");

const { ContestProblemManager } = require("../managers/ContestProblemManager");
const { ContestSubmitter } = require("../submitters/ContestSubmitter");

const { Routes } = require("../session/Addresses");
const { ContestLanguageInformationManager } = require("../managers/ContestLanguageInformationManager");

class Contest extends AtCoderStructure {
  constructor(client, data) {
    super(client);

    this.id = data.id?.toLowerCase();

    this.problems = new ContestProblemManager(this);

    this.languages = new ContestLanguageInformationManager(this);
    this.submitter = new ContestSubmitter(this);

    this._patch(data);
  }

  _patch(data) {
    const assign = this._makeAssigner(data);

    assign(["startsAt", "start_epoch_second"], new Date(data.start_epoch_second));
    assign(["duration", "duration_second"], undefined, null);
    assign("title");
    assign(["ratedRange", "rate_change"], undefined, null);

    return this;
  }

  fetch(force = true) {
    return this.client.contests.fetch(this.id, { force });
  }

  get url() {
    return Routes.Web.contest(this.id);
  }

  get done() {
    return this.startsAt < new Date();
  }

  toString() {
    return `[${this.title}](${this.url}})`;
  }
}

module.exports = { Contest };
