const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const { client } = require("../../../session");

const { BaseWebviewHtmlBuilder } = require("../BaseWebviewBuilder");

class RatingWebviewHtmlBuilder extends BaseWebviewHtmlBuilder {
  static #html_string = fs.readFileSync(path.join(__dirname, "./media/index.html"), "utf8");
  constructor(context) {
    super(context);
  }
  async build(webview) {
    super.build(webview);
    webview.html = await this.#generateHtmlString(webview);
  }
  async #generateHtmlString(webview) {
    const nonce = this._generateNonce();
    let response = RatingWebviewHtmlBuilder.#html_string;
    response = response.replace(/\{\{nonce\}\}/g, nonce);
    response = response.replace(/\{\{webview.cspSource\}\}/g, webview.cspSource);
    response = response.replace(/\{\{username\}\}/g, client.user.username);
    response = response.replace(
      /\{\{scriptUri-main\}\}/g,
      webview.asWebviewUri(vscode.Uri.joinPath(this._baseUri, "RatingView", "media", "main.js"))
    );
    response = response.replace(
      /\{\{scriptUri-ratingIcon\}\}/g,
      webview.asWebviewUri(vscode.Uri.joinPath(this._baseUri, "RatingView", "media", "ratingIcon.js"))
    );
    response = response.replace(
      /\{\{styleMainUri\}\}/g,
      webview.asWebviewUri(vscode.Uri.joinPath(this._baseUri, "RatingView", "media", "main.css"))
    );
    return response;
  }
}

module.exports = { RatingWebviewHtmlBuilder };
