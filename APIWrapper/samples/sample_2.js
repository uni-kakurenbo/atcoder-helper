"use strict";

const { Client, Util } = require("../src");
const client = new Client();

(async () => {
  console.log(await client.contests.fetch("abc123"));
  console.log(await client.contests.fetch("abc242"));
  console.log(client.contests.cache.get("abc242"));
  // console.log(client.contests.cache.get("ahc007"));
  console.log(await client.contests.fetch("ahc007"));
  console.log(client.contests.cache.get("ahc007"));

  console.log(await client.contests.fetch("abc242", { cache: false }));
  const ABC242 = await client.contests.fetch("abc242");

  console.log(ABC242.done);

  console.log(await ABC242.problems.fetch("abc242_a"));
  console.log(ABC242.problems.cache.get("abc242_a"));
  // console.log(ABC242.problems.cache.get("abc242_b"));

  const ABC242_C = await ABC242.problems.fetch("abc242_c");
  console.log((await ABC242_C.samples.fetch(2)).test("248860093\n"));
  console.log((await ABC242_C.samples.fetch(3)).test("248860093\n"));

  const ABC242_D = await ABC242.problems.fetch("abc242_d");
  console.log(await ABC242_D.samples.fetch(2));
  console.log(await ABC242_D.samples.fetch(1));

  await client.contests.fetchScheduled();
  // console.log(client.contests.cache);
  //console.log(client.contests.cache.get("abc253").done);

  console.log(await client.contests.fetch("ahc011"));
  // console.log(client.contests.scraper.cache);
  console.log(await client.contests.fetch("ahc011"));

  const ABC254 = await client.contests.fetch("abc254");
  const ABC254_C = await ABC254.problems.fetch("abc254_c");
  await ABC254_C.samples.fetchAll();
  console.log(ABC254_C.samples.cache);
})();
