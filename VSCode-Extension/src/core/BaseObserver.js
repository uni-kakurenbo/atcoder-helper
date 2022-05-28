const EventEmitter = require("events");

class BaseObserver extends EventEmitter {
  constructor(context) {
    super({ captureRejections: true });
    this.context = context;
  }
}

module.exports = { BaseObserver };
