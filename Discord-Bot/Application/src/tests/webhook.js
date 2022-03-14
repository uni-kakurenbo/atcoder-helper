"use strict";

const { MessageEmbed, Collection } = require("discord.js");
const { client } = require("../config.js");

return;
client.on("messageCreate", async (message) => {
  if (message.channel.id !== "897753285677699093") return;
  if (message.author.bot) return;
  if (message.content !== "test") return;

  const webhook = await message.channel.parent.createWebhook(client.user.username, {
    avatar: `https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.png`,
  });
  console.log(webhook);
  webhook
    .send({ threadId: "897753285677699093", content: "hello!" })
    .then((message) => console.log(`Sent message: ${message.content}`))
    .catch(console.error);

  const embed = new MessageEmbed().setTitle("Some Title").setColor("#0099ff");
  webhook.send({
    threadId: "903265709000384522",
    content: "Webhook test",
    username: "some-username",
    avatarURL: "https://i.imgur.com/AfFp7pu.png",
    embeds: [embed],
  });
});
