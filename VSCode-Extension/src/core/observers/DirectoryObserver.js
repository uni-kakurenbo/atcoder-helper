const vscode = require("vscode");
const { BaseObserver } = require("./BaseObserver.js");

class TextEditorObserver extends BaseObserver {
  static #Rejections = {
    INVALID_EVENT: Symbol("An invalid event was provided."),
  };
  static Events = {
    ACTIVE_TEXT_EDITOR_CHANGE: Symbol("activeTextEditorChange"),
  };
  static #eventSymbols = Object.values(TextEditorObserver.Events);

  constructor(context) {
    super(context);

    vscode.window.onDidChangeActiveTextEditor((textEditor) => {
      this.#emitters[TextEditorObserver.Events.ACTIVE_TEXT_EDITOR_CHANGE](textEditor);
    });
  }

  #emitters = [];

  build(target) {
    if (TextEditorObserver.#eventSymbols.includes(target)) {
      this.#emitters[target] = (...values) => this.emit(target.description, ...values);
    } else if (target === void 0) {
      TextEditorObserver.#eventSymbols.forEach((event) => {
        this.#emitters[event] = (...values) => this.emit(event.description, ...values);
      });
    } else {
      this._throw(TextEditorObserver.#Rejections.INVALID_EVENT, target);
    }
  }

  destroy(target) {
    if (TextEditorObserver.#eventSymbols.includes(target)) {
      this.#emitters[target] = () => {};
    } else if (target === void 0) {
      this.#eventSymbols.forEach((event) => (this.#emitters[event] = () => {}));
      console.log(this.#emitters);
    } else {
      this._throw(TextEditorObserver.#Rejections.INVALID_EVENT);
    }
  }
}

module.exports = { TextEditorObserver };
