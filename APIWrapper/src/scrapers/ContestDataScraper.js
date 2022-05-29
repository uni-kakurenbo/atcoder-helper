"use strict";

const { BaseScraper } = require("./BaseScraper");

const { JSDOM } = require("jsdom");
const { Routes } = require("../session/Addresses");

class ContestDataScraper extends BaseScraper {
  constructor(contests) {
    super(contests.client);

    this.contests = contests;
  }
  async fromId(id) {
    const response = await this.client.gateway.get(Routes.Web.contest(id));
    const {
      window: { document },
    } = new JSDOM(response.data);
    const times = document.querySelector(".contest-duration").querySelectorAll("time");
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
