"use strict";

const { JSDOM } = require("jsdom");
const { Routes } = require("../session/Addresses");
const { HttpResponseBody } = require("../structures/HttpResponseBody");

const { CachedDataScraper } = require("./CachedScraper");

class ContestDataScraper extends CachedDataScraper {
  constructor(contests) {
    super(contests.client);

    this.contests = contests;
  }

  async load(id, options) {
    const url = Routes.Web.contest(id);

    let response = await this._fetch(url, options);

    const {
      window: { document },
    } = new JSDOM(response);

    const times = document.querySelectorAll(".contest-duration time");
    return {
      id,
      rate_change: document.querySelectorAll("span.mr-2")[1].textContent.replace("Rated対象: ", ""),
      duration_second: (new Date(times[1].textContent).getTime() - new Date(times[0].textContent).getTime()) / 1000,
      title: document.querySelector("a.contest-title").textContent,
      start_epoch_second: times[0].textContent, // Date String
    };
  }
}

module.exports = { ContestDataScraper };
