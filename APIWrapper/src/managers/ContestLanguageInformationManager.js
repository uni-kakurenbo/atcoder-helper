"use strict";

const { CachedManager } = require("./CachedManager");

const { ContestLanguageInformation } = require("../structures/ContestLanguageInformation");
const { ContestSubmissionFormScraper } = require("../scrapers/ContestSubmissionFormScraper");

class ContestLanguageInformationManager extends CachedManager {
  constructor(contest, iterable) {
    super(contest.client, ContestLanguageInformation, iterable);

    this.contest = contest;

    this.scraper = new ContestSubmissionFormScraper(this);
  }

  async fetchList({ cache = true, force = false } = {}) {
    const languages = await this.scraper.load({ cache, force });
    languages.forEach((language) => {
      this._add(language, cache, { id: language.name.toLowerCase() });
    });
  }
}

module.exports = { ContestLanguageInformationManager };
