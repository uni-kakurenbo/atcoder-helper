"use strict";

const { Client, Util } = require("../src");
const client = new Client();

(async () => {
  console.log(client.contests.cache.get("abc242"));
  await client.contests.fetchAll();
  console.log(client.contests.cache.get("abc242"));

  const ABC242 = client.contests.cache.get("abc242");
  console.log(ABC242.problems.cache.get("abc242_a"));
  await ABC242.problems.fetchAll();
  console.log(ABC242.problems.cache.get("abc242_a"));
})();
