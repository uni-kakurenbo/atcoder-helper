"use strict";

const vscode = require("vscode");

async function registerWorkspace(workspace) {
  const workspaceSelect_quickPick = await vscode.window.showQuickPick([
    {
      label: `$(root-folder) aaa`,
    },
  ]);
}

async function setup({ suggestLogin = false, requireNwePassword } = {}) {
  await requireUsername.call(this);
  await requirePassword.call(this, requireNwePassword);

  if (suggestLogin) {
    await vscode.window
      .showInformationMessage("Stored your AtCoder-account authentication information successfully.", { title: "Log in" })
      .then((_selected) => {
        if (_selected?.title === "Log in") {
          require("./session.js").signIn.call(
            this,
            {
              location: vscode.ProgressLocation.Notification,
              title: "Log in",
            },
            { force: true }
          );
        }
      });
  }

  return;
}

async function requireUsername() {
  const username_inputBox = await vscode.window.createInputBox();
  Object.assign(username_inputBox, {
    title: "Username",
    placeholder: "chokudai",
    value: (await this.context.workspaceState.get("username")) ?? "",
    prompt: "It is case-insensitive.",
  });
  username_inputBox.show();
  const username = await new Promise((resolve, reject) => {
    username_inputBox.onDidChangeValue(() => {
      verifyInput();
    });
    username_inputBox.onDidAccept(() => {
      verifyInput();
      if (username_inputBox.value) resolve(username_inputBox.value);
    });

    function verifyInput() {
      if (username_inputBox.value) username_inputBox.validationMessage = "";
      else username_inputBox.validationMessage = "Please enter a valid username.";
    }
  });
  username_inputBox.dispose();
  await this.context.workspaceState.update("username", username);

  return;
}
/*
async function requirePassword(requireNwePassword = true) {
  console.log({ requireNwePassword });
  if (requireNwePassword) {
    const password = await vscode.window.showInputBox({
      title: "Password",
      password: true,
    });
    await this.context.workspaceState.update("password", password);
  } else await vscode.window.showInformationMessage("Saved sessions will be used.");

  return;
}*/

async function requirePassword(requireNwePassword = true) {
  if (requireNwePassword) {
    const password_inputBox = await vscode.window.createInputBox();
    Object.assign(password_inputBox, {
      title: "Password",
      password: true,
    });
    password_inputBox.show();
    const password = await new Promise((resolve, reject) => {
      password_inputBox.onDidChangeValue(() => {
        verifyInput();
      });
      password_inputBox.onDidAccept(() => {
        verifyInput();
        if (password_inputBox.value) resolve(password_inputBox.value);
      });

      function verifyInput() {
        if (password_inputBox.value) password_inputBox.validationMessage = "";
        else password_inputBox.validationMessage = "Please enter a valid password.";
      }
    });
    password_inputBox.dispose();
    await this.context.workspaceState.update("password", password);
  } else await vscode.window.showInformationMessage("Saved sessions will be used.");

  return;
}
module.exports = { setup, registerWorkspace, requireUsername, requirePassword };
