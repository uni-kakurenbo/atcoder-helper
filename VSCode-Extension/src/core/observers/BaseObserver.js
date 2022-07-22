const EventEmitter = require("events");

class BaseObserver extends EventEmitter {
  constructor(context) {
    super({ captureRejections: true });
    Object.defineProperty(this, "context", { value: context });
  }
  _throw(error, ...values) {
    throw new Error(`${error.description} ${values.join(", ")}`);
  }
}

module.exports = { BaseObserver };
