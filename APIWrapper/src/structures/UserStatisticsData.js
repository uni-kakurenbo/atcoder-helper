"use strict";

const { AtCoderStructure } = require("./AtCoderStructure");

const { Routes } = require("../session/Addresses");

class UserStatisticsData extends AtCoderStructure {
  static BaseRoute = Routes.API.Problems.Statics;
  constructor(client, data, user) {
    super(client);

    this.user = user;

    this.id = data.id;
    Object.defineProperty(this, "url", { value: data._url ?? null });

    this._patch(data);
  }

  _patch(data) {
    const assign = this._makeAssigner(data);

    assign("count");
    assign("rank");

    return this;
  }

  async fetch() {
    const response = await this.client.adapter.get(this.url, {
      params: { user: this.user.username },
    });
    return this._patch(response.data);
  }
}

module.exports = { UserStatisticsData };
