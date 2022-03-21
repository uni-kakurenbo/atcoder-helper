"use strict";

const { Client, Util } = require("../src");
const client = new Client();

client.contests.events.start();
client.on("contestStart", (contest) => {
  console.log(contest);
});
