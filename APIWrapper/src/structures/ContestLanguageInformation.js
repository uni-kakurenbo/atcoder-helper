"use strict";

const { AtCoderStructure } = require("./AtCoderStructure");

class ContestLanguageInformation extends AtCoderStructure {
  constructor(contest, data) {
    super(contest.client);

    this.id = data.id;

    this.contest = contest;

    this._patch(data);
  }

  _patch(data) {
    const assign = this._makeAssigner(data);

    assign("name");
    assign("description");

    return this;
  }
}

module.exports = { ContestLanguageInformation };
