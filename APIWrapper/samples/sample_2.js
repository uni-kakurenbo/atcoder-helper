"use strict";

const { Client, Util } = require("../src");
const client = new Client();

(async () => {
  console.log(await client.contests.fetch("abc123"));
  console.log(await client.contests.fetch("abc242"));
  console.log(client.contests.cache.get("abc242"));
  console.log(client.contests.cache.get("ahc007"));
  console.log(await client.contests.fetch("ahc007"));
  console.log(client.contests.cache.get("ahc007"));

  const ABC242 = client.contests.cache.get("abc242");

  console.log(ABC242.done);

  console.log(await ABC242.problems.fetch("abc242_a"));
  console.log(ABC242.problems.cache.get("abc242_a"));
  console.log(ABC242.problems.cache.get("abc242_b"));

  const ABC242_C = await ABC242.problems.fetch("abc242_c");
  const ABC_C_sampleCases = await ABC242_C.samples.fetchAll();
  console.log(ABC_C_sampleCases);
  console.log(ABC_C_sampleCases.get("3").test("248860093\n"));

  await client.contests.fetchScheduled();
  console.log(client.contests.cache);
  //console.log(client.contests.cache.get("abc253").done);

  console.log(await client.contests.fetch("ahc011"));
})();
