"use strict";

const vscode = require("vscode");
const { DirectoryObserver } = require("./core/DirectoryObserver.js");

function activate(context) {
  this.context = context;

  const directoryObserver = new DirectoryObserver(context);
  directoryObserver.create();

  console.log("AtCoder Helper is now active.");

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  this.statusBar = {
    async setStatus(status = "") {
      switch (status.toLowerCase()) {
        case "pending":
          statusBarItem.text = "$(vm-outline) AtCoder Helper";
          statusBarItem.command = "extension.login";
          statusBarItem.tooltip = "Sign in to AtCoder";
          break;
        case "connected":
          const username = await context.workspaceState.get("username");
          statusBarItem.text = "$(vm-connect) AtCoder Helper";
          statusBarItem.command = "extension.reconnect";
          statusBarItem.tooltip = new vscode.MarkdownString(`Signed in to AtCoder as \`${username}\``);
          break;
        case "testing":
          statusBarItem.text = "$(vm-running) AtCoder Helper";
          break;
        case "accepted":
          statusBarItem.text = "$(vm-active) AtCoder Helper";
          break;
      }
    },
  };
  this.statusBar.setStatus("pending").then(() => {
    statusBarItem.show();
  });

  let disposable;

  // Debug Command
  disposable = vscode.commands.registerCommand("extension.debug", () => {
    const { client } = require("./session.js");
    vscode.window.showInformationMessage(`Rating: ${client.user.status.algorithm.rating}`);
  });
  context.subscriptions.push(disposable);

  // Hello World
  disposable = vscode.commands.registerCommand("extension.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World!");
  });
  context.subscriptions.push(disposable);

  // register workspace
  disposable = vscode.commands.registerCommand("extension.registerWorkspace", () => {
    require("./setting.js").registerWorkspace.call(this);
  });
  context.subscriptions.push(disposable);

  // set up
  disposable = vscode.commands.registerCommand("extension.setup", () => {
    require("./setting.js").setup.call(this, { suggestLogin: true });
  });
  context.subscriptions.push(disposable);

  // Sing in
  const session = require("./session.js");

  (async () => {
    try {
      const username = await context.workspaceState.get("username");
      const password = await context.workspaceState.get("password");
      await session.client.login(username, password);
      this.statusBar.setStatus("connected");
    } catch (_error) {
      console.log(_error);
    }
  })();

  disposable = vscode.commands.registerCommand("extension.login", () => {
    session.signIn.call(
      this,
      {
        location: vscode.ProgressLocation.Notification,
        title: "Log in",
      },
      { force: true }
    );
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand("extension.reconnect", () => {
    session.signIn.call(this, {
      location: vscode.ProgressLocation.Notification,
      title: "Reconnect",
    });
  });
  context.subscriptions.push(disposable);

  // Sign out
  disposable = vscode.commands.registerCommand("extension.logout", () => {
    session.signOut.call(this, {
      location: vscode.ProgressLocation.Notification,
      title: "Log out",
    });
  });
  context.subscriptions.push(disposable);
  return;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
