"use strict";

const { BaseScraper } = require("./BaseScraper");

const { JSDOM } = require("jsdom");
const { Routes } = require("../session/Addresses");

class ContestProblemDataScraper extends BaseScraper {
  constructor(problems) {
    super(problems.client);

    this.problems = problems;
  }
  async fromId(id) {
    const contestId = this.problems.contest.id;
    const response = await this.client.gateway.get(Routes.Web.problem(contestId, id));
    const {
      window: { document },
    } = new JSDOM(response.data);
    return {
      id,
      title: document.querySelector("span.h2").textContent.trim().replace(" - ", ". "),
      contest_id: contestId,
    };
  }
}

module.exports = { ContestProblemDataScraper };
