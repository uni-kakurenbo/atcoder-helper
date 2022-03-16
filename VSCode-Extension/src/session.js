"use strict";

const vscode = require("vscode");
const { Client, Session, Util } = require("../../APIWrapper/src");
const { sleep } = require("./utils/sleep.js");
const { requireUsername, requirePassword } = require("./setting.js");

const client = new Client();

async function signIn(progressOptions, { cache = true } = {}) {
  console.log({ cache });

  const updateIdentifier = async () => {
    return {
      username: await this.context.workspaceState.get("username"),
      password: await this.context.workspaceState.get("password"),
    };
  };

  await vscode.window.withProgress(progressOptions, async (progress) => {
    progress.report({ message: `Getting previous authentication information to sign-in...` });
    let config = await updateIdentifier();
    console.log(config);

    if (!config.username) {
      progress.report({ message: `Please enter your username.` });
      await requireUsername.call(this);
      config = await updateIdentifier();
    }

    if (cache) {
      if (Session.cachedSessionExists(config.username)) {
        progress.report({ message: "Restoring a cached session..." });
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
      await client.login(config.username, config.password, { cache });
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
