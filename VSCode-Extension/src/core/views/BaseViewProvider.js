class BaseViewProvider {
  constructor(context) {
    Object.defineProperties(this, {
      context: { value: context },
      _view: { configurable: true },
    });
  }
  set view(view) {
    Object.defineProperty(this, "_view", {
      writable: true,
      configurable: true,
    });
    Object.defineProperty(this, "_view", { value: view });
  }
  get view() {
    return this._view;
  }
}

module.exports = { BaseViewProvider };
