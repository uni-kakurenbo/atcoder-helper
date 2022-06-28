"use strict";

const { CachedDataScraper } = require("./CachedScraper");

const { JSDOM } = require("jsdom");
const { Routes } = require("../session/Addresses");
const { Cache } = require("../Cache");

class ContestSubmissionFormScraper extends CachedDataScraper {
  constructor(languages) {
    super(languages.client);

    this.languages = languages;
  }
  async load(options) {
    const url = Routes.Web.submit(this.languages.contest.id);
    const response = await this._fetch(url, options);
    const {
      window: { document },
    } = new JSDOM(response);

    const languages = [];
    document
      .querySelector("#select-lang > div")
      .querySelectorAll("option")
      .forEach((data) => {
        if (data.value) {
          const name = data.textContent.split(" ")[0];
          languages.push({
            id: data.value,
            name,
            description: data.textContent,
          });
        }
      });
    return languages;
  }
}

module.exports = { ContestSubmissionFormScraper };
