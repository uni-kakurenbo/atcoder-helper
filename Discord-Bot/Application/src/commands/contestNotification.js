"use strict";

const { client } = require("../config.js");

const { Client: AtCoderClient } = require("../../../../APIWrapper/src");
const { Database } = require("../system");
const functions = require("../functions");
const { Colors } = require("../utils");

const atcoder = new AtCoderClient();
atcoder.contests.events.start();

const db = new Database.LocalStorage("AtCoder_ContestNotification");

(async () => {
  await db.begin();
  await db.clear();
  if ((await db.get("channelIds")).rest) db.set("channelIds", []);
})();

module.exports.notify = async function (contest) {
  const channelIds = (await db.get("channelIds")).data.first();
  const roleIdList = (await db.get("channelIds")).data.first();
  channelIds.forEach(async (_channelId) => {
    const contestId = contest.id?.tpUpperCase();
    const channel = await client.channels.fetch(_channelId);
    const message = await nel.send(`${contestId} are coming up!`);
    const thread = await channel.threads.create({ name: contestId, startMessage: message, autoArchiveDuration: 60 * 24 });
    const role = await channel.guild.roles.fetch(roleIdList[_channelId]);
    thread.send(role.toString()).then((_message) => _message.delete());
  });
};

module.exports.register = async function (channel = this.from.channel) {
  channel = await client.channels.fetch(channel?.id ?? channel);
  const channelIds = (await db.get("channelIds")).data.first();
  if (channelIds.includes(channel.id)) {
    this.from.channel.send({
      embeds: [functions.getEmbed(Colors.WRONG_ANSWER, `Rejected`, "The provided channel was already registered.", true)],
    });
  } else {
    channelIds.push(channel.id);
    db.set("channelIds", channelIds);
    this.from.channel.send({
      embeds: [
        functions.getEmbed(Colors.ACCEPTED, `Registered`, `The notifications for the contest coming will be sent to ${channel.toString()}.`, true),
      ],
    });
  }
};
