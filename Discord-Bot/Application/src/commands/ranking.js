"use strict";

const { Client: AtCoderClient } = require("../../../../APIWrapper");
const functions = require("../functions.js");
const { Database } = require("../system");
const { Colors } = require("../utils");
const Messages = require("../utils/Messages");

const db = new Database.LocalStorage("AtCoder_Username");
db.begin();

const types = {
  ac: ["acceptedCount", "Accepted Count"],
  rated_point: ["ratedPointSum", "Rated Point Sum"],
  streak: ["longestStreakCount", "Longest Streak Count"],
};

module.exports = async function ({ type, username: atcoder_username } = {}) {
  const registeredName = (await db.get(this.from.user.id)).data.first();
  atcoder_username ??= registeredName ?? "chokudai";

  const client = new AtCoderClient();
  const user = await client.users.fetch(atcoder_username);

  if (await user.exists()) {
    const statisticsData = await user.statistics.cache.get(types[type][0]).fetch();
    return {
      embeds: [
        functions
          .getEmbed(Colors.ACCEPTED, user.username, undefined, true)
          .addField(types[type][1], `Count: \`${statisticsData.count}\`\nRank: \`${statisticsData.rank}\``),
      ],
    };
  } else {
    return {
      embeds: [Messages.Embed.INVALID_USER],
    };
  }
};
