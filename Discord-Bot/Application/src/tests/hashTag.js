const Discord = require("discord.js");
const { client } = require("../config.js");

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.partial) return;
  if (message.channel.type === "DM") return;
  //if (!message.content.startsWith("kt!")) return;
  let hashTagCategory = message.guild.channels.cache.find(
    (channel) => channel.type == "GUILD_CATEGORY" && channel.name == "ハッシュタグ"
  );
  let hashTags = message.content.match(/<#\d+>/gi);
  let hashTagIds = [];
  let authorName = message.member.nickname;
  if (!authorName) {
    authorName = message.author.username;
  }
  let MessageEmbed = new Discord.MessageEmbed()
    .setColor(0xff4ff3)
    .setAuthor({ name: authorName, iconURL: message.author.avatarURL() })
    .setURL(message.url)
    .setDescription(">>> " + message.content)
    .setTimestamp(new Date(message.createdAt));

  hashTags?.forEach((tag) => {
    let id = tag.replace(/[<#>]/g, "");
    hashTagIds.push(id);
    let hashTagChannel = message.guild.channels.cache.get(id);
    if (hashTagChannel.parent != hashTagCategory) return;
    hashTagChannel.send({
      embeds: [MessageEmbed.setTitle("#" + message.channel.name)],
    });
  });

  let originalTags = message.content.match(/(#\S+)/gi);
  if (hashTagCategory == void 0 || originalTags == void 0) return;
  originalTags.forEach(async (tag) => {
    let alreadyCreateFlag = false;
    hashTagIds.forEach((id) => {
      if (tag.indexOf(id) != -1) {
        alreadyCreateFlag = true;
      }
    });
    if (alreadyCreateFlag) return;
    let createdChannel = await message.guild.channels.create(tag, {
      parent: hashTagCategory,
    });
    createdChannel.send({
      embeds: [
        MessageEmbed.setTitle("#" + message.channel.name).setDescription(
          ">>> " + message.content.replace(new RegExp(`(${tag})`, "gi"), "**$1**")
        ),
      ],
    });
  });
});
