const vscode = require("vscode");
const { BaseObserver } = require("./BaseObserver.js");

class DirectoryObserver extends BaseObserver {
  constructor(context) {
    super(context);
  }
  create() {
    vscode.window.onDidChangeActiveTextEditor((textEditor) => {
      console.log(textEditor.document.uri);
      vscode.window.showInformationMessage(textEditor.document.uri);
    });
  }
}

module.exports = { DirectoryObserver };
