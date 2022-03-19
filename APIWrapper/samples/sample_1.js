"use strict";

const { Client, Util } = require("../src");
const client = new Client();

client.on("ready", async () => {
  console.log("Ready!");

  console.log(client.user);
  console.log(client.user.status.algorithm.rating);
  await client.user.statistics.cache.get("acceptedCount").fetch();
  await client.user.statistics.cache.get("ratedPointSum").fetch();
  await client.user.statistics.cache.get("longestStreakCount").fetch();
  console.log(client.user.statistics.cache);
  console.log(Util.convertRatingToColorName(client.user.status.algorithm.rating));
});

client.login();
