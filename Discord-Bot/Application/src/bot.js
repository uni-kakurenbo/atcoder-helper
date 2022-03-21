"use strict";

require("dotenv").config();

const { Util } = require("./utils");
const { client } = require("./config.js");

const { Logger, ProcessError, Database } = require("./system");

const registry = new Database.SystemStorage();
registry.begin();

client.on("ready", () => {
  process.on("uncaughtException", (err, origin) => {
    console.setColor("red").log(err);
    console.setColor("red").log(origin);
    //new ProcessError(err, origin).log();
  });

  console.setColor("blue").log(`${client.user.tag} でログインしています。`);
  Logger.log(Logger.Type.START_UP, { date: Util.startsAt });
  require("./test.js");
  require("./command.js");
  (async () => {
    let initialLaunch = (await registry.get("initialLaunchAt")).data.first();
    console.setColor("cyan").log(initialLaunch);
    if (!initialLaunch) {
      initialLaunch = Util.startsAt.getTime();
      await registry.set("initialLaunchAt", initialLaunch);
    }
    let count = 0;
    setInterval(() => {
      let now = new Date();
      const srvkz = client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c);
      const list = [
        `起動後${now - Util.startsAt}秒/通算${now - initialLaunch}秒...`,
        `${client.guilds.cache.size}サーバーで稼働中/総計ユーザー数：${srvkz}人`,
      ];

      client.user.setActivity(list[count], { type: "PLAYING" });
      count++;

      if (count >= list.length) {
        count = 0;
      }
    }, 1000 * 15);
  })();
  return;
});

if (process.env.EXECUTION_LOCATION === "replit") {
  client.login(process.env.TOKEN).catch(console.setColor("red").log);
} else if (process.env.EXECUTION_LOCATION === "local") {
  console.log("local");
  client.login(process.env.TEST_TOKEN).catch(console.setColor("red").log);
}
