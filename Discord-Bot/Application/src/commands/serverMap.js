"use strict";

const {
  Util: { splitMessage },
  MessageAttachment,
  Permissions,
} = require("discord.js");

module.exports = async function ({
  output: _format,
  accessible: _filteringByPermissions = false,
  voice: _showVoices = true,
  thread: _showThreads = "none",
}) {
  //filter and sort
  const channels = this.from.guild.channels.cache.filter((_channel) => !_channel.parent);
  channels
    .sort((a, b) => a.position - b.position)
    .sort(function (a, b) {
      if (a.type !== "GUILD_CATEGORY" && b.type === "GUILD_CATEGORY") return -1;
      if (a.type === "GUILD_TEXT" && b.type === "GUILD_VOICE") return -1;
    });
  //console.log(channels);

  //Fetch sreads
  if (_showThreads !== "none") await this.from.guild.channels.fetchActiveThreads();
  if (_showThreads === "all") {
    await Promise.all(
      this.from.guild.channels.cache.map((_channel) => {
        if (_channel.type === "GUILD_TEXT") {
          return _channel.threads.fetchArchived();
        }
      })
    );
  }

  const isAccessible = (_channel) => {
    //console.log(_channel.permissionsFor(this.from.member))
    //console.log(Permissions.FLAGS.VIEW_CHANNEL)
    //console.log(!_channel.permissionsFor(this.from.member).has(Permissions.FLAGS.VIEW_CHANNEL, false))
    return (
      _filteringByPermissions &&
      !_channel.permissionsFor(this.from.member).has(Permissions.FLAGS.VIEW_CHANNEL, false)
    );
  };

  //Generate
  let serverMap = this.from.guild.name + "\n";
  let [categories, tops] = channels.partition((_channel) => _channel.type === "GUILD_CATEGORY");

  //Add top layer channels
  if (!_showVoices) tops = tops.filter((_channel) => _channel.type !== "GUILD_VOICE");
  tops.forEach((_channel) => (serverMap += "├" + _channel.toString() + "\n"));
  serverMap += "│\n";

  //Add Categories
  categories.forEach((_category) => {
    if (_category === channels.last()) {
      serverMap += "└";
    } else {
      serverMap += "├";
    }
    serverMap += _category.name + "\n";
    //Add child-channels for each category
    const children = _category.children;
    children
      .sort((a, b) => a.position - b.position)
      .sort((a, b) => (a.type === "GUILD_TEXT" && b.type === "GUILD_VOICE" ? -1 : 0));
    children.forEach((_channel) => {
      if (!_showVoices && _channel.type === "GUILD_VOICE") return;
      if (isAccessible(_channel)) return;
      serverMap += _category === channels.last() ? "　" : "│";
      serverMap += _channel === children.last() ? "└" : "├";
      serverMap += _channel.toString() + "\n";

      //Add child-threads for each channel
      if (_showThreads === "none") return;
      //console.log(_channel ?.threads.cache)
      const threads = _channel?.threads.cache ?? [];
      threads.sort((a, b) => a.position - b.position);
      threads.forEach((_thread) => {
        //if(isAccessible(_channel)) return;
        serverMap += _category === channels.last() ? "　" : "│";
        serverMap += _channel === children.last() ? "　" : "│";
        serverMap += _thread === threads.last() ? "└" : "├";
        serverMap += _thread.toString() + "\n";
      });
    });

    //Add an empty line
    if (_category != channels.last()) {
      serverMap += "│\n";
    }
  });

  //Send
  if (_format === "file")
    return { files: [new MessageAttachment(Buffer.from(serverMap, "utf-8"), "ServerMap.txt")] };
  else return splitMessage(serverMap);
};
