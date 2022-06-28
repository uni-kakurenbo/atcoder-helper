"use strict";

const { CachedDataScraper } = require("./CachedScraper");

const { JSDOM } = require("jsdom");
const { Routes } = require("../session/Addresses");

class ContestProblemSampleDataScraper extends CachedDataScraper {
  static #InputIdentifier = "入力例";
  static #OutputIdentifier = "出力例";
  static #InputCaseIdRegExp = /入力例\s*(\S*)/;
  static #OutputCaseIdRegExp = /出力例\s*(\S*)/;

  constructor(samples) {
    super(samples.client)._with(samples.problem.contest.problems.scraper.cache);

    this.samples = samples;
  }
  async load(id, { cache = true } = {}) {
    const { inputs, outputs } = await this._scrapeSampleCases();
    const matchedInput = inputs.find(({ id: _id }) => _id === id);
    const matchedOutput = outputs.find(({ id: _id }) => _id === id);

    if (!matchedInput || !matchedOutput) return null;
    return { id, in: matchedInput.value, out: matchedOutput.value };
  }

  async exists() {
    const tasks = await this.#fetchSampleCases();
    const cases = tasks.filter((_task) =>
      _task.querySelector("h3").textContent.includes(ContestProblemSampleDataScraper.#InputIdentifier)
    );
    return cases.length > 0;
  }

  async _scrapeSampleCases() {
    const tasks = await this.#fetchSampleCases();

    const inputs = tasks
      .filter((_task) =>
        _task.querySelector("h3").textContent.includes(ContestProblemSampleDataScraper.#InputIdentifier)
      )
      .map((_task) => ({
        id: _task.querySelector("h3").textContent.match(ContestProblemSampleDataScraper.#InputCaseIdRegExp)[1],
        value: _task.querySelector("pre")?.textContent,
      }));
    const outputs = tasks
      .filter((res) => res.querySelector("h3").textContent.includes(ContestProblemSampleDataScraper.#OutputIdentifier))
      .map((res) => ({
        id: res.querySelector("h3").textContent.match(ContestProblemSampleDataScraper.#OutputCaseIdRegExp)[1],
        value: res.querySelector("pre")?.textContent,
      }));

    return { inputs, outputs };
  }

  async #fetchSampleCases() {
    // const response = await this.samples.problem.contest.problems.scraper._fetch(
    //   Routes.Web.problem(this.samples.problem.contestId, this.samples.problem.id)
    // );
    const response = await this._fetch(Routes.Web.problem(this.samples.problem.contestId, this.samples.problem.id));

    const {
      window: { document },
    } = new JSDOM(response);

    const sections = document.querySelectorAll("#task-statement section");
    const tasks = [].map.call(sections, (_element) => _element);

    return tasks;
  }
}

module.exports = { ContestProblemSampleDataScraper };
