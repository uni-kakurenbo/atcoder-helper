"use strict";

const { Cache } = require("../Cache");
const { ContestLanguageInformationManager } = require("../managers/ContestLanguageInformationManager");
const { ContestSubmissionFormScraper } = require("../scrapers/ContestSubmissionFormScraper");
const { Routes } = require("../session/Addresses");
const { BaseSubmitter } = require("./BaseSubmitter");

class ContestSubmitter extends BaseSubmitter {
  constructor(contest) {
    super(contest.client);

    this.contest = contest;
  }

  async submit(problemId, languageIdOrName, source = "") {
    await this.contest.languages.fetchList();
    const language = this.contest.languages.resolver.resolve(languageIdOrName);
    const data = new URLSearchParams();
    data.append("data.TaskScreenName", problemId);
    data.append("data.LanguageId", language.id);
    data.append("sourceCode", source);
    data.append("csrf_token", this.client.session.token);
    return this.client.adapter.post(Routes.Web.submit(this.contest.id), data);
  }
}

module.exports = { ContestSubmitter };
