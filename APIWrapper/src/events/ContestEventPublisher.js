"use strict";

const { Constants } = require("../configs/Constants");

const { BaseEventPublisher } = require("./BaseEventPublisher");
const { Events } = require("../utils");

class ContestEventPublisher extends BaseEventPublisher {
  constructor(contests, options) {
    super(contests.client);

    this.contests = contests;

    this.interval = options?.interval ?? 3000; //Constants.API

    this.evoked = {
      [Events.CONTEST_START]: [],
      [Events.CONTEST_15m]: [],
      [Events.CONTEST_60m]: [],
    };
  }

  async start() {
    await this.contests.fetchAll();
    this.observe(false);
    this.timer = setInterval(this.observe.bind(this), this.interval);
  }
  clear() {
    clearInterval(this.timer);
  }

  observe(emit) {
    this.contests.cache.forEach((_contest) => {
      const rest_ms = _contest.startsAt - new Date();
      if (rest_ms <= 60 * 60 * 1000 && rest_ms > 0) this._evoke(Events.CONTEST_60m, _contest, { emit });
      else if (rest_ms <= 15 * 60 * 1000 && rest_ms > 0) this._evoke(Events.CONTEST_15m, _contest, { emit });
      else if (rest_ms <= 0) this._evoke(Events.CONTEST_START, _contest, { emit });
    });
  }

  _evoke(event, contest, { emit = true } = {}) {
    if (this.evoked[event].includes(contest.id)) return;
    this.evoked[event].push(contest.id);

    if (emit) super._evoke(event, contest);
  }
}

module.exports = { ContestEventPublisher };
