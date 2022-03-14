"use strict";

require("dotenv").config();

const Discord = require("discord.js");
const { Intents, Client } = Discord;

const path = require("path");

const options = {
  intents:
    Intents.FLAGS.GUILDS |
    Intents.FLAGS.GUILD_MESSAGES |
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS |
    Intents.FLAGS.GUILD_MEMBERS |
    Intents.FLAGS.DIRECT_MESSAGES,
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
};

const client = new Client(options);
exports.clientOptions = options;
exports.client = client;

const command_guildIds = ["949266798463815680"];
exports.command_guildIds = command_guildIds;

exports.adminIds = ["687599949093011495"];

const systemLogChannels = {
  stable: {
    synthesized: ["949281988282581024"],
    start_up: ["949282748831522846"],
    command: ["949282913088843776"],
    error: ["949283014649708614"],
    database: ["949283161928519680"],
    api: ["949283272444223508"],
  },
};
exports.systemLogChannels = systemLogChannels;

exports.applications = {
  talkPattern: {
    receivePendingRequests: ["929192301077606482"],
  },
  composeMusic: {
    saveFileCount: 5,
    folder: path.relative(process.cwd(), `${__dirname}/../database/musicFiles`),
    musicFile(number) {
      return `${this.folder}/file_${number}.mp3`;
    },
    get historyFile() {
      return `${this.folder}/history.json`;
    },
    tool: "https://compose-musec--generate-url.glitch.me/",
  },
};
