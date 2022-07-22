const vscode = require("vscode");

class BaseWebviewHtmlBuilder {
  constructor(context) {
    Object.defineProperty(this, "context", { value: context });

    this._extensionUri = this.context.extensionUri;
    this._baseUri = vscode.Uri.joinPath(this._extensionUri, "src", "core", "views");
  }
  build(webview) {
    webview.options = {
      ...this.options,
      enableScripts: true,
      "unsafe-hashes": true,
      localResourceRoots: [this.context.extensionUri],
    };
  }
  _generateNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}

module.exports = { BaseWebviewHtmlBuilder };
