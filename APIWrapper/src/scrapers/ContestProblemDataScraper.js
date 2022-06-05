"use strict";

const { CachedDataScraper } = require("./CachedScraper");

const { JSDOM } = require("jsdom");
const { Routes } = require("../session/Addresses");

class ContestProblemDataScraper extends CachedDataScraper {
  constructor(problems) {
    super(problems.client);

    this.problems = problems;
  }
  async load(id, options) {
    const contestId = this.problems.contest.id;
    const url = Routes.Web.problem(contestId, id);

    let response = await this._fetch(url, options);

    const {
      window: { document },
    } = new JSDOM(response);

    return {
      id,
      title: document.querySelector("span.h2").textContent.trim().replace(" - ", ". "),
      contest_id: contestId,
    };
  }
}

module.exports = { ContestProblemDataScraper };
