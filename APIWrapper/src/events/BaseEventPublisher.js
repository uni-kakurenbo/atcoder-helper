"use strict";

const { EventEmitter } = require("events");

class BaseEventPublisher extends EventEmitter {
  constructor(client) {
    super({ captureRejections: true });
    Object.defineProperties(this, {
      client: { value: client },
      timer: { writable: true },
      evoked: { writable: true },
    });
  }

  _evoke(event, data) {
    this.emit(event, data);
    this.client.emit(event, data);
  }
}

module.exports = { BaseEventPublisher };
