"use strict";

const { AtCoderStructure } = require("./AtCoderStructure");

class ContestProblemSample extends AtCoderStructure {
  constructor(client, data, problem) {
    super(client);

    this.id = data.id;

    this.problem = problem;

    this._patch(data);
  }

  _patch(data) {
    const assign = this._makeAssigner(data);

    assign("in");
    assign("out");

    return this;
  }

  fetch(force = true) {
    return this.problems.samples.fetch(this.id, { force });
  }

  test(answer = "\n") {
    return answer.replace(/\s+/g, "\n") === this.out.replace(/\s+/g, "\n");
  }
}

module.exports = { ContestProblemSample };
