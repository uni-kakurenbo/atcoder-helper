"use strict";

const vscode = require("vscode");

const config = require("../.secret/config.json");

function activate(context) {
  this.context = context;

  console.log("AtCoder Helper is now active.");

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBarItem.accessibilityInformation = { label: "Reconnect to the account." };
  statusBarItem.text = "$(remote-explorer-view-icon) AtCoder Helper";
  statusBarItem.command = "extension.reconnect";
  statusBarItem.tooltip = new vscode.MarkdownString(
    `Signed-in to AtCoder as \`${config.username}\``
  );
  statusBarItem.show();

  let disposable;

  // Hello World
  disposable = vscode.commands.registerCommand("extension.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World!");
  });
  context.subscriptions.push(disposable);

  // set up
  disposable = vscode.commands.registerCommand("extension.setup", () => {
    require("./setting.js").setup.call(this);
  });
  context.subscriptions.push(disposable);

  // Sing in
  const session = require("./session.js");
  disposable = vscode.commands.registerCommand("extension.login", () => {
    session.signIn.call(this, {
      location: vscode.ProgressLocation.Notification,
      title: "Login",
    });
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand("extension.reconnect", () => {
    session.signIn.call(this, {
      location: vscode.ProgressLocation.Window,
      title: "Reconnect",
    });
  });
  context.subscriptions.push(disposable);

  // Sign out
  disposable = vscode.commands.registerCommand("extension.logout", () => {
    session.signOut.call(this);
  });
  context.subscriptions.push(disposable);
  return;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
