"use strict";

const { Client: AtCoderClient, Util } = require("../../../../APIWrapper");
const functions = require("../functions.js");
const { Database } = require("../system");
const { Colors } = require("../utils");
const Messages = require("../utils/Messages");

const db = new Database.LocalStorage("AtCoder_Username");
db.begin();

module.exports.userRating = async function ({ username: atcoder_username, reflecting = false } = {}) {
  const registeredName = (await db.get(this.from.user.id)).data.first();
  atcoder_username ??= registeredName ?? "chokudai";

  const { user, rating } = await fetchUserAndRating(atcoder_username);
  if (await user.exists()) {
    console.log(atcoder_username, registeredName);
    if (reflecting && atcoder_username.toLowerCase() === registeredName.toLowerCase()) {
      await reflect(this.from, rating);
    }
    return {
      embeds: [
        functions
          .getEmbed(Util.convertRatingToColorCode(rating.algorithm.now), user.username, undefined, true)
          .addField("Algorithm", getFieldData("algorithm"), true)
          .addField("Heuristic", getFieldData("heuristic"), true),
      ],
    };
    function getFieldData(type = "algorithm") {
      const value = type === "algorithm" ? `Now: \`${rating[type].now}\`\nHighest: \`${rating[type].highest}\`` : `\`${rating[type]}\``;
      return user.status[type].history.cache.filter((contest) => contest.isRated).size ? value : `No data available`;
    }
    async function reflect(interaction, rating) {
      await interaction.guild.roles.fetch();
      return interaction.member.roles.add(
        interaction.guild.roles.cache.find((_role) => _role.name === Util.convertRatingToColorName(rating.algorithm.now))
      );
    }
  } else {
    return {
      embeds: [Messages.Embed.INVALID_USER],
    };
  }
};

module.exports.createRoles = function () {
  if (!this.from.member.permissions.has("MANAGE_ROLES")) return "Missing Permission";

  const names = Object.keys(Util.colors);
  const values = Object.values(Util.colors);

  this.from.guild.roles.cache.forEach((_role) => {
    if (names.includes(_role.name) && values.includes(_role.color)) _role.delete();
  });

  Object.entries(Util.colors).forEach(([_name, _color]) => {
    this.from.guild.roles.create({
      name: _name,
      color: _color,
      //unicodeEmoji: "\u{1F4C8}",
    });
  });
  return "Created Successfully";
};

async function fetchUserAndRating(atcoder_username) {
  const client = new AtCoderClient();
  const user = await client.users.fetch(atcoder_username);
  const rating = {
    algorithm: {
      now: user.status.algorithm.rating,
      highest: user.status.algorithm.highestRating,
    },
    heuristic: user.status.heuristic.rating,
  };
  return { user, rating };
}
