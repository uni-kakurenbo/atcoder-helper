"use strict";

const { Collection, MessageActionRow, MessageSelectMenu } = require("discord.js");
const { client, command_guildIds } = require("../config.js");
const { Util } = require("../utils");

const {
  errors,
  API,
  SlashCommand,
  PlainCommand,
  CommandController,
  PageController,
} = require("../system");

console.log();
const os = require("os");
console.log(os.cpus());
console.log(process.memoryUsage());

/*
client.on("messageCreate", message => {
  if (message.channel.id != "879671366444515340") return;
  if(message.author.bot) return;
  console.log(message.attachments);
});
*/

client.on("messageCreate", (message) => {
  if (message.author.id == client.user.id) return;
  if (message.content != "/bt!db_test") return;
  console.log("ping: ", client.ws.ping);
  const ping_test = new Date();
  API.fetch(
    "post",
    "https://script.google.com/macros/s/AKfycbzqU2cXUrPsgFhD4JBxj92Nj5af8i8xO72AzJ33FcOaEBPyA8I1j91LgUznmQt6zhmd/exec",
    {
      data: {
        action: "ping",
        /*action:"set",
        type:"normal",
        key:"test",
        data:{
          hello1:"WorldA",
          hello2:0,
          hello3: {inner1:"aa", inner2:4},
          hello4: {inner1:"bb", inner2: {innner1:"aaa", innner2:8}},
          hello5:"WorldE",
        }*/
      },
    }
  )
    .then((_res) => {
      const ping_test2 = new Date();
      console.log(_res, "time:", ping_test2 - ping_test);
    })
    .catch(console.log);
});

const resend = new SlashCommand({
  type: SlashCommand.RegistrationType.GUILD,
  guildIds: ["927468992162058251"],
  execute: (_txt) => {
    return {
      embeds: [{ title: "にゃーん", color: 0x00ffff, description: _txt + "ですね！" }],
    };
  },
});
resend
  .setName("resend_dev")
  .setDescription("オウム返し")
  .addStringOption((_option) =>
    _option.setName("content").setDescription("The content to send").setRequired(true)
  );

const evalCommand = new PlainCommand({
  prefix: "/am!",
  name: "eval",
  type: SlashCommand.RegistrationType.GUILD,
  guildIds: ["927468992162058251"],
  options: { split: false },
  execute: function* (_arguments) {
    let code = _arguments.replace(/^```js\n/, "").replace(/```$/, "");
    let eval_returns;
    let response = (() => {
      if (Util.isAdmin(this.author.id)) {
        if (code.match(/process|eval|token/i)) {
          return errors.accessError(this);
        }
        let _res;
        try {
          eval_returns = eval(code);
          this.react("\u{2705}");
          _res = Util.getEmbed(0x00ff00, "Ran Eval", "Status:`success`");
        } catch (e) {
          _res = errors.runtimeError(this, e);
        }
        return _res;
      } else {
        return errors.permissionError(this);
      }
    })();
    if (eval_returns) yield String(eval_returns);
    return { embeds: [response] };
  },
});

const pageCmd = new SlashCommand({
  name: "page_test",
  description: "Show you my helps",
  type: SlashCommand.RegistrationType.GUILD,
  guildIds: command_guildIds,
  execute: function () {
    //アロー関数は不可
    const pageController = new PageController({
      title: "page_test",
      pageLoop: true,
      pageNumber: true,
      endMessage: { content: "thanks" },
      authors: [this.from?.user.id],
    });
    pageController.addPages(
      { embeds: [Util.getEmbed(0x00ffff, "0ページ目の内容")] },
      { embeds: [Util.getEmbed(0x00ffff, "1ページ目の内容")] },
      { embeds: [Util.getEmbed(0x00ffff, "2ページ目の内容")] }
    );
    return pageController.begin(this.from); //起動
  },
});

const test_commands = new CommandController([resend, evalCommand /*translate, pageCmd*/]); //Managerに登録

test_commands.addCommand(
  new SlashCommand({
    name: "cmds-test",
    description: "Get commandlist.",
    type: SlashCommand.RegistrationType.GUILD,
    guildIds: command_guildIds,
    execute() {
      const pageController = new PageController({
        title: "page_test",
        pageLoop: true,
        pageNumber: true,
        endMessage: { content: "thanks" },
        authors: [this.from?.user.id],
      });
      test_commands.generateHelpEmbed({ split: 1 }).forEach((_embed) => {
        pageController.addPages({ embeds: [_embed] });
      });
      return pageController.begin(this.from); //起動
    },
  })
);

void (async function () {
  const _returns = await test_commands.Application.register();
  console.log(_returns);
  //test_commands.Slash.remove().then(console.log);
  /*{  //update
    resend.setPermissions = async (_guildId) => {
      console.log("TEST")
      const res = (await Util.filterUsersByPermissions(await client.guilds.fetch(_guildId), ["MANAGE_CHANNELS"]))
        .map(_user => ({ type: "USER", id: _user.id, permission: false }))
      console.log(res)
      return res;
    },
    resend.editCommand().catch(console.log);
  }*/
})();
