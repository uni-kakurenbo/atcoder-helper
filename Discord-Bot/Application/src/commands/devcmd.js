"use strict";

const Discord = require("discord.js");
const { client, slashguild } = require("../config");

const { Database } = require("../system");
const { Util } = require("../utils");

module.exports = async function* (arg1) {
  const db = new Database.LocalStorage("test");
  await db.begin();
  const result = await db.get("devComd_test");
  console.log(result);
  yield { embeds: [Util.getEmbed(0x00f521, `Read`, `Result: ${result.data.first()}`, true)] };
  await db.set("devComd_test", arg1);
  return { embeds: [Util.getEmbed(0x00f521, `Write`, `Value: ${arg1}`, true)] };
};
