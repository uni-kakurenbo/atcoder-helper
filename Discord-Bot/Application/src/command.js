"use strict";

const { command_guildIds, adminIds } = require("./config.js");

const { SlashCommand, MessageCommand, UserCommand, CommandController } = require("./system");

//const functions = require("./functions.js");

const commands = new CommandController();

console.log(command_guildIds);

const devtest = new SlashCommand({
  type: SlashCommand.RegistrationType.GUILD,
  guildIds: ["949266798463815680"],
  execute: require("./commands/devcmd.js"),
})
  .setName("devtest")
  .setDescription("The command for developers")
  .addStringOption((_option) => _option.setName("arg1").setDescription("1st args").setRequired(true));
commands.addCommand(devtest);

commands.addCommand(
  new MessageCommand({
    type: MessageCommand.RegistrationType.GUILD,
    guildIds: command_guildIds,
    ephemeral: true,
    async execute() {
      await this.from.channel.fetch(this.from.targetId).catch(console.log);
      return "Cache へ追加しました。";
    },
    setPermissions(_guildId) {
      console.log("settingPermissions in", _guildId);
      return adminIds.map((_userId) => ({ type: "USER", id: _userId, permission: true }));
    },
  })
    .setName("fetch")
    .setDefaultPermission(false)
);

commands.addCommand(
  new SlashCommand({
    type: MessageCommand.RegistrationType.GUILD,
    guildIds: command_guildIds,
    execute: require("./commands/contestNotification.js").register,
  })
    .setName("register")
    .setDescription("Register a channel to notify contests' coming up.")
    .addChannelOption((_option) => _option.setName("channel").setDescription("The channel to send notifications. (default: here)").setRequired(false))
);

commands.addCommand(
  new SlashCommand({
    type: MessageCommand.RegistrationType.GUILD,
    guildIds: command_guildIds,
    execute: require("./commands/linkAtCoder.js"),
  })
    .setName("link")
    .setDescription("Links your account on AtCoder.")
    .addStringOption((_option) => _option.setName("username").setDescription("Your name on AtCoder").setRequired(true))
);

commands.addCommand(
  new SlashCommand({
    type: MessageCommand.RegistrationType.GUILD,
    guildIds: command_guildIds,
    argumentTypes: SlashCommand.ArgumentType.OBJECT,
    execute: require("./commands/rating.js").userRating,
  })
    .setName("rating")
    .setDescription("Shows the rating.")
    .addStringOption((_option) => _option.setName("username").setDescription("username to fetch on AtCoder"))
    .addBooleanOption((_option) => _option.setName("reflecting").setDescription("Whether to reflect the rating on the role"))
);

commands.addCommand(
  new SlashCommand({
    type: MessageCommand.RegistrationType.GUILD,
    guildIds: command_guildIds,
    argumentTypes: SlashCommand.ArgumentType.OBJECT,
    execute: require("./commands/ranking.js"),
  })
    .setName("rank")
    .setDescription("Shows the counts and the ranks for several pieces of information.")
    .addStringOption((_option) =>
      _option
        .setName("type")
        .setDescription("Type of information to be displayed")
        .addChoices([
          ["Accepted Count", "ac"],
          ["Rated Point Sum", "rated_point"],
          ["Longest Streak", "streak"],
        ])
        .setRequired(true)
    )
    .addStringOption((_option) => _option.setName("username").setDescription("username on AtCoder"))
);

commands.addCommand(
  new UserCommand({
    type: MessageCommand.RegistrationType.GUILD,
    guildIds: command_guildIds,
    execute: require("./commands/rating.js").createRoles,
    ephemeral: true,
  }).setName("creates roles")
  //.setDescription("Create roles according to AtCoder's coloring.")
);

commands.addCommand(
  new SlashCommand({
    type: SlashCommand.RegistrationType.GUILD,
    guildIds: command_guildIds,
    execute: ["I am running!"],
  })
    .setName("test")
    .setDescription("Command for developers")
);

commands.addCommand(
  new SlashCommand({
    type: SlashCommand.RegistrationType.GUILD,
    guildIds: command_guildIds,
    argumentTypes: SlashCommand.ArgumentType.OBJECT,
    execute: require("./commands/serverMap.js"),
  })
    .setName("map")
    .setDescription("Generates a map of the guild.")
    .addStringOption((_option) =>
      _option
        .setName("output")
        .setDescription("Whether to output as a text file or as a message (Default:message)")
        .addChoices([
          ["as a message", "message"],
          ["as a text file", "file"],
        ])
    )
    .addBooleanOption((_option) =>
      _option.setName("accessible").setDescription("Whether to narrow down the displayed channels by permissions (Default:false)")
    )
    .addBooleanOption((_option) => _option.setName("voice").setDescription("Whether to show voice channels (Default:true)"))
    .addStringOption((_option) =>
      _option
        .setName("thread")
        .setDescription("Whether to show thread channels (Default:none)")
        .addChoices([
          ["None", "none"],
          ["Active", "active"],
          ["All", "all"],
        ])
    )
);

commands.addCommand(
  new SlashCommand({
    type: SlashCommand.RegistrationType.GUILD,
    guildIds: command_guildIds,
    execute: require("./commands/ping.js"),
  })
    .setName("ping")
    .setDescription("Measures the latency to and from each service.")
    .addBooleanOption((_option) => _option.setName("details").setDescription("Whether to measure detailed information"))
);

commands.addCommand(
  new SlashCommand({
    type: SlashCommand.RegistrationType.GUILD,
    guildIds: command_guildIds,
    timeout: 30 * 1000,
    execute: require("./commands/mathSolver.js"),
  })
    .setName("math")
    .setDescription("Solves some math problems. (This command is provided by WolframAplha.)")
    .addStringOption((_option) => _option.setName("formula").setDescription("What you want me to solve").setRequired(true))
);

const translate = require("./commands/translate.js");
const translation = new SlashCommand({
  type: SlashCommand.RegistrationType.GUILD,
  guildIds: command_guildIds,
  execute: translate.execute,
})
  .setName("translate")
  .setDescription("Translates your sentence.");
commands.addCommand(translation);

const wikipedia = new SlashCommand({
  type: SlashCommand.RegistrationType.GUILD,
  guildIds: command_guildIds,
  argumentTypes: SlashCommand.ArgumentType.OBJECT,
  execute: require("./commands/wikipedia.js").search,
})
  .setName("wikipedia")
  .setDescription("Searches on Wikipedia.");
commands.addCommand(wikipedia);

void (async function () {
  await commands.Application.register().then((_res) => {
    console.log(_res);
    ["slash", "user", "message"].forEach((_type) => {
      _res[_type].forEach((_result) => {
        if (_result.status === "rejected") console.log(_result.reason);
      });
    });
  });
  //await commands.Application.remove().then(console.log);
  //updateTranslation();
  {
    //update
    const languages = await translate.getLanguages(25);
    translation.options = [
      {
        type: "STRING",
        name: "sentence",
        description: "What you want me to translate",
        required: true,
      },
      {
        type: "STRING",
        name: "to",
        description: "Target language",
        required: true,
        choices: languages,
      },
      { type: "STRING", name: "from", description: "Source language", choices: languages },
    ];
    translation.editCommand().catch(console.log);

    wikipedia.options = [
      {
        type: "STRING",
        name: "word",
        description: "Word which you want to research",
        required: true,
      },
      {
        type: "INTEGER",
        name: "limit",
        description: "Total number of pages to return [1-500] (Default:10)",
      },
      {
        type: "STRING",
        name: "language",
        description: "Language of the output (default:Japanese)",
        choices: languages,
      },
    ];
    wikipedia.editCommand().catch(console.log);
    //resend.editCommand().catch(console.log);
  }
})();

module.exports.Run = async function Run(message) {};
