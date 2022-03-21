"use strict";

const { Client: AtCoderClient } = require("../../../../APIWrapper");
const functions = require("../functions.js");
const { Database } = require("../system");
const { Colors } = require("../utils");

const db = new Database.LocalStorage("AtCoder_Username");
db.begin();

module.exports = async function* (atcoder_username) {
  const client = new AtCoderClient();
  const user = await client.users.fetch(atcoder_username);
  if (await user.exists()) {
    const result = await db.get(this.from.user.id);
    const previous = result.data.first();
    await db.set(this.from.user.id, atcoder_username);
    return {
      embeds: [
        functions.getEmbed(
          Colors.ACCEPTED,
          `Update Settings`,
          `Registered AtCoder username has been changed.\n\`${previous}\` to \`${atcoder_username}\``,
          true
        ),
      ],
    };
  } else {
    return {
      embeds: [functions.getEmbed(Colors.WRONG_ANSWER, "Invalid User", "An invalid username was provided.")],
    };
  }
};
