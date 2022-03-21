"use strict";
require("dotenv").config();

const { Events } = require("../utils");
const { Error } = require("../errors");
const { Routes } = require("../session/Addresses");

const { BaseClient } = require("./BaseClient");
const { ClientUser } = require("../structures/ClientUser");

const { UserManager } = require("../managers/UserManager");
const { ContestManager } = require("../managers/ContestManager");

class Client extends BaseClient {
  constructor(options) {
    super(options);

    this._validateOptions();

    Object.defineProperties(this, {
      username: { writable: true },
      password: { writable: true },
    });

    if (!this.username && "ATCODER_USERNAME" in process.env) {
      this.username = process.env.ATCODER_USERNAME;
    } else {
      this.username = null;
    }
    if (!this.password && "ATCODER_PASSWORD" in process.env) {
      this.password = process.env.ATCODER_PASSWORD;
    } else {
      this.password = null;
    }

    this.user = null;
    this.readyTimestamp = null;

    this.users = new UserManager(this);
    this.contests = new ContestManager(this);
  }

  get readyAt() {
    return this.readyTimestamp && new Date(this.readyTimestamp);
  }

  get uptime() {
    return this.readyTimestamp && Date.now() - this.readyTimestamp;
  }

  async login(username = this.username, password = this.password, { force } = {}) {
    if (!username || typeof username !== "string") throw new Error("USERNAME_INVALID");
    await this.session.connect(username, password, { force });
    await this.fetchUserStatus(username);

    this.user = new ClientUser(this, username, {
      status: await this.fetchUserStatus(username),
    });

    this.username = username;

    this.readyTimestamp = Date.now();

    this.emit(Events.READY, this.username);
    return this.user;
  }

  async fetchUserStatus(username) {
    const userHistoryURL = Routes.API.Official.userHistory(username);
    const userAlgorithmHistoryResponse = await this.adapter.get(userHistoryURL);
    const userHeuristicHistoryResponse = await this.adapter.get(userHistoryURL, {
      params: { contestType: "heuristic" },
    });

    return {
      algorithm: { history: userAlgorithmHistoryResponse.data },
      heuristic: { history: userHeuristicHistoryResponse.data },
    };
  }

  isReady() {
    // eslint-disable-next-line no-undef
    return this.session.status === Status.READY;
  }

  async destroy() {
    await super.destroy();
    this.username = this.password = null;
    this.emit(Events.DESTROYED);
  }

  // eslint-disable-next-line no-unused-vars
  _validateOptions(options = this.options) {}
}

module.exports = { Client };
