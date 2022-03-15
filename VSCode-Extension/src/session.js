"use strict";

const vscode = require("vscode");
const { Client, Util } = require("../../APIWrapper/src");

const client = new Client();

async function signIn(progressOptions) {
  const updateIdentifier = async () => {
    return {
      username: await this.context.workspaceState.get("username"),
      password: await this.context.workspaceState.get("password"),
    };
  };

  vscode.window.withProgress(progressOptions, async (progress) => {
    let config = await updateIdentifier();
    console.log(config);

    if (!config.username || !config.password) await require("./setting").setup.call(this);
    config = await updateIdentifier();

    progress.report({ message: `Singing-in to ${config.username}` });

    await client.login(config.username, config.password).catch((_error) => {
      vscode.window.showWarningMessage(`The connection was rejected; ${_error.message}`);
      console.log(_error);
    });

    return;
  });

  client.on("ready", async () => {
    //statusBarItem.text =
  });
  return;
}

async function signOut() {
  await client.destroy();
  await this.context.workspaceState.update("username", undefined);
  await this.context.workspaceState.update("password", undefined);
  return;
}

module.exports = { signIn, signOut };
