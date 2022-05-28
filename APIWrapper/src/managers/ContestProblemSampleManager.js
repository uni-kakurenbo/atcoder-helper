"use strict";

const { CachedManager } = require("./CachedManager");
const { ContestProblemSample } = require("../structures/ContestProblemSample");

const { Routes } = require("../session/Addresses");

const { JSDOM } = require("jsdom");

class ContestProblemSampleManager extends CachedManager {
  static #InputIdentifier = "入力例";
  static #OutputIdentifier = "出力例";
  static #InputCaseIdRegExp = /入力例\s*(\S*)/;
  static #OutputCaseIdRegExp = /出力例\s*(\S*)/;

  constructor(problem, iterable) {
    super(problem.client, ContestProblemSample, iterable);

    this.problem = problem;
  }

  async fetch(sample, { cache = true, force = false, all = true } = {}) {
    if (all) await this.fetchAll({ cache, force });

    const id = this.resolveId(sample)?.toLowerCase();
    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    const { inputs, outputs } = await this.#scrapeSampleCases();
    const matchedInput = inputs.find(({ id: _id }) => _id === id);
    const matchedOutput = outputs.find(({ id: _id }) => _id === id);

    if (!matchedInput || !matchedOutput) return null;
    return this._add({ id, in: matchedInput.value, out: matchedOutput.value }, cache, { extras: [this.problem] });
  }

  async fetchAll({ cache = true, force = false } = {}) {
    const { inputs, outputs } = await this.#scrapeSampleCases();

    inputs.forEach((_input) => {
      if (!force && this.cache.has(_input.id)) return;
      const output = outputs.find((_output) => _input.id === _output.id);
      this._add({ id: _input.id, in: _input.value, out: output?.value ?? "" }, cache, {
        extras: [this.problem],
      });
    });

    return this.cache;
  }

  async exists() {
    const tasks = await this.#fetchSampleCases();
    const cases = tasks.filter((_task) =>
      _task.querySelector("h3").textContent.includes(ContestProblemSampleManager.#InputIdentifier)
    );
    return cases.length > 0;
  }

  async #scrapeSampleCases() {
    const tasks = await this.#fetchSampleCases();

    const inputs = tasks
      .filter((_task) => _task.querySelector("h3").textContent.includes(ContestProblemSampleManager.#InputIdentifier))
      .map((_task) => ({
        id: _task.querySelector("h3").textContent.match(ContestProblemSampleManager.#InputCaseIdRegExp)[1],
        value: _task.querySelector("pre")?.textContent,
      }));
    const outputs = tasks
      .filter((res) => res.querySelector("h3").textContent.includes(ContestProblemSampleManager.#OutputIdentifier))
      .map((res) => ({
        id: res.querySelector("h3").textContent.match(ContestProblemSampleManager.#OutputCaseIdRegExp)[1],
        value: res.querySelector("pre")?.textContent,
      }));

    return { inputs, outputs };
  }

  async #fetchSampleCases() {
    const response = await this.client.adapter.get(Routes.Web.problem(this.problem.contestId, this.problem.id));
    const {
      window: { document },
    } = new JSDOM(response.data);

    const sections = document.querySelector("#task-statement").querySelectorAll("section");
    const tasks = [].map.call(sections, (_element) => _element);

    return tasks;
  }
}

module.exports = { ContestProblemSampleManager };
