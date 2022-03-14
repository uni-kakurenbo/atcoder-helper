"use strict";

const Discord = require("discord.js");

module.exports = {
  runtimeError(message, e) {
    message.react("\u{274C}");
    return new Discord.MessageEmbed()
      .setColor(0xff0000)
      .setTitle("実行時エラー")
      .setDescription(String(e))
      .setTimestamp();
  },

  permissionError(message) {
    message.react("\u{26d4}");
    return new Discord.MessageEmbed()
      .setColor(0xff0000)
      .setTitle("権限エラー")
      .setDescription("このコマンドは開発者限定です。")
      .setTimestamp();
  },
  accessError(message) {
    message.react("\u{1F6D1}");
    return new Discord.MessageEmbed()
      .setColor(0xff0000)
      .setTitle("アクセスエラー")
      .setDescription("危険性のあるコマンドへのアクセス権限がありません。")
      .setTimestamp();
  },
};
