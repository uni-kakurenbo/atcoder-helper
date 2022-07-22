const { BaseViewProvider } = require("./BaseViewProvider.js");

class WebviewViewProvider extends BaseViewProvider {
  constructor(context, options = {}) {
    super(context);
    this.options = options;
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;
  }
}

module.exports = { WebviewViewProvider };
