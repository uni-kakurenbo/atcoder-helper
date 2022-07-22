const vscode = require("vscode");

const { TextEditorObserver } = require("./observers/DirectoryObserver.js");
const { RatingViewProvider } = require("./views/RatingView");

function standing() {
  this.context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(RatingViewProvider.viewType, new RatingViewProvider(this.context))
  );

  const textEditorObserver = new TextEditorObserver(context);
  textEditorObserver.build();

  //textEditorObserver.destroy(TextEditorObserver.Events.ACTIVE_TEXT_EDITOR_CHANGE);
  textEditorObserver.on("activeTextEditorChange", (textEditor) => {
    if (textEditor) {
    }
  });
}

module.exports = { standing };
