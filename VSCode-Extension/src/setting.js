"use strict";

const vscode = require("vscode");
const { Client, Util } = require("../../APIWrapper/src");
const config = require("../.secret/config.json");

const client = new Client();

async function setup() {
  const username = await vscode.window.showInputBox({
    title: "Username",
    prompt: "It is case-insensitive.",
    placeholder: "chokudai",
  });
  const password = await vscode.window.showInputBox({
    title: "Password",
    password: true,
  });
  await this.context.workspaceState.update("username", username);
  await this.context.workspaceState.update("password", password);
  return;
}

module.exports = { setup };
