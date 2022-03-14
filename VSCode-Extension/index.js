"use strict";

const vscode = require("vscode");
const { Client, Util } = require("../APIWrapper/src");

const config = require("./.secret/config.json");

function activate(context) {
  console.log('Congratulations, your extension "helloworld-minimal-sample" is now active!');

  const helloWorld = vscode.commands.registerCommand("extension.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World!");
  });
  context.subscriptions.push(helloWorld);

  const login = vscode.commands.registerCommand("extension.login", async () => {
    vscode.window.showInformationMessage("connecting...");

    const client = new Client();

    client.on("ready", async () => {
      vscode.window.showInformationMessage("Ready!!");
      console.log("Ready!");

      console.log(client.user);
      console.log(client.user.status.algorithm.rating);
      await client.user.statistics.cache.get("acceptedCount").fetch();
      await client.user.statistics.cache.get("ratedPointSum").fetch();
      await client.user.statistics.cache.get("longestStreakCount").fetch();
      console.log(client.user.statistics.cache);
      console.log(Util.convertRatingToColorName(client.user.status.algorithm.rating));
    });
    await client.login(config.username, config.password).catch(() => {
      vscode.window.showInformationMessage("rejected.");
    });
  });
  context.subscriptions.push(login);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
