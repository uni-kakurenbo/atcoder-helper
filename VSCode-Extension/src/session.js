"use strict";

const vscode = require("vscode");
const { Client, Session, Util } = require("../../APIWrapper/src");
const { requireUsername, requirePassword } = require("./setting.js");

const client = new Client();

async function signIn(progressOptions, { force = false } = {}) {
  console.log({ force });

  const updateIdentifier = async () => {
    return {
      username: await this.context.workspaceState.get("username"),
      password: await this.context.workspaceState.get("password"),
    };
  };

  await vscode.window.withProgress(progressOptions, async (progress) => {
    progress.report({ message: `Getting stored authentication information to sign-in...` });
    let config = await updateIdentifier();

    if (!force) {
      if (!config.username) {
        progress.report({ message: `Username is not saved. Please enter your username.` });
        await requireUsername.call(this);
        config = await updateIdentifier();
      }

      if (Session.cachedSessionExists(config.username)) {
        progress.report({ message: "Restoring the cached session..." });
        try {
          await client.login(config.username, config.password);
          vscode.window.showInformationMessage("Signed in successfully.");
          this.statusBar.setStatus("connected");

          return;
        } catch (error) {
          progress.report({
            message: `Restoration of cached session was rejected. Please enter the password.`,
          });
          await requirePassword.call(this);
        }
      } else {
        progress.report({
          message: `The cached session is not existed. Please enter the password.`,
        });
        await requirePassword.call(this);
      }
      config = await updateIdentifier();
    }

    progress.report({
      message: `Singing in to AtCoder as ${config.username}...`,
    });

    try {
      await client.login(config.username, config.password, { force });
      vscode.window.showInformationMessage("Signed in successfully.");
      this.statusBar.setStatus("connected");
    } catch (_error) {
      vscode.window.showWarningMessage(`The connection was rejected: ${_error.message}`);
      console.log(_error);
    }

    return;
  });

  return;
}

async function signOut(progressOptions) {
  vscode.window.withProgress(progressOptions, async (progress) => {
    progress.report({ message: "Singing out from AtCoder..." });
    await client.destroy();

    progress.report({ message: "Destroying the authentication information..." });
    await this.context.workspaceState.update("username", undefined);
    await this.context.workspaceState.update("password", undefined);

    this.statusBar.setStatus("pending");

    return;
  });

  return;
}

module.exports = { signIn, signOut, client };
