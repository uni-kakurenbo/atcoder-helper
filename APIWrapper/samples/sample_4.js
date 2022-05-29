"use strict";

const { Client, Util } = require("../src");
const client = new Client();

client.on("ready", async () => {
  console.log(client.user);

  const AHC001 = await client.contests.fetch("ahc011");
  const AHC001_A = await AHC001.problems.fetch("ahc011_a");
  console.log(AHC001_A);
  console.log(await AHC001_A.samples.fetchAll());
});

client.login();
