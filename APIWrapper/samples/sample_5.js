"use strict";

const { Client, Util } = require("../src");
const client = new Client();

client.on("ready", async () => {
  console.log(client.user);

  const IROHA_CONTEST = await client.contests.fetch("iroha2019-day3");
  const IROHA_CONTEST_J = await IROHA_CONTEST.problems.fetch("iroha2019_day3_j");
  console.log(IROHA_CONTEST_J);
  await IROHA_CONTEST_J.submit(4056, "Judgement\n");
});

client.login();
