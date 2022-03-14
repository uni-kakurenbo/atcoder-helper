"use strict";

require("dotenv").config();

const { Collection } = require("discord.js");
const { inlineCode, codeBlock } = require("@discordjs/builders");

const { client, systemLogChannels } = require("../config.js");
const { Util } = require("../utils");

const log = async (
  type,
  {
    date,
    command,
    storage,
    method,
    message,
    error,
    data,
    response: { config: apiConfig, data: apiResponse } = {},
  }
) => {
  //if (process.env.EXECUTION_LOCATION !== "replit") return;
  const logChannels = systemLogChannels[process.env.LOG_OUTPUT];
  if (!logChannels) return;
  let channelIds;
  let information = new Collection();
  switch (type) {
    case Type.START_UP:
      channelIds = logChannels.start_up;
      information.set(
        "StartsAt",
        Util.getTime(date).tz("Asia/Tokyo").format("YYYY/MM/DD HH:mm:ss")
      );
      break;

    case Type.ERROR:
      channelIds = logChannels.error;

      if ("toCollection" in error) information = information.concat(error.toCollection());
      else information.set(Symbol(codeBlock("js", error?.stack)));

      if (error?.origin) information.set("Exception origin", error.origin);
      break;

    case Type.COMMAND:
      channelIds = logChannels.command;
      information
        .set("Command", command)
        .set(Symbol("$"))
        .set("Message", inlineCode(message?.content))
        .set("User", `${message?.author} [${message?.author.tag}] (${message?.author.id})`)
        .set(Symbol("$"))
        .set("Id", message?.id)
        .set(Symbol("$"))
        .set("Guild", `${message?.guild} (${message?.guild?.id})`)
        .set(
          "Channel",
          `${message?.channel} [${message?.channel?.name}] (${message?.channel?.id})`
        );
      break;

    case Type.API:
      channelIds = logChannels.api;
      const replacers = {
        response(key, value) {
          if (!key) return value;
          return String(value);
        },
      };
      const config = { url: apiConfig.url, method: apiConfig.method };
      if (apiConfig?.data) config.body = JSON.parse(apiConfig.data);
      if (apiConfig?.params) config.parameters = apiConfig.params;
      if (config?.length > 180) information.set("Request", "_longString_");
      else if (config)
        information.set("Request", codeBlock("json", JSON.stringify(config, replacers.request, 2)));
      if (apiResponse?.length > 180) information.set("Response", "_longString_");
      else if (apiResponse)
        information.set(
          "Response",
          codeBlock("json", JSON.stringify(apiResponse, replacers.response, 2))
        );
      break;

    case Type.DATABASE:
      channelIds = logChannels.database;
      information.set("Storage", `\`${storage}\``);
      information.set("Method", `\`${method}\``);
      if (data) information.set("Data/Content", codeBlock("json", JSON.stringify(data, null, 2)));
      break;

    default:
      throw new Error("This is Invalid log type:" + type);
  }
  let informationString = "",
    informationStringForDev = "";
  information.forEach((_content, _tag) => {
    //console.log(typeof _tag)
    if (typeof _tag === "symbol") {
      if (_tag?.description === "$") informationString += "\n";
      else informationString += `${_tag?.description}\n`;
    } else {
      informationString += `${_tag}: ${_content}\n`;
    }
  });
  //console.log(response.data, information, informationString, channelIds);
  let channelTags = [];
  const sentChannelIds = [];
  //const title = type === Type.ERROR && error?.type ? error.type : type.description;
  const title = type.description;
  channelIds.forEach((_chId) => {
    //console.log(_chId)
    channelTags.push(`<#${_chId}>`);
    sentChannelIds.push(
      Util.send(_chId, { embeds: [Util.getEmbed(0x00ff00, title, informationString)] }).catch(
        console.log
      )
    );
  });
  information = information.filter((_, _key) => typeof _key !== "symbol");

  channelTags = channelTags.join(" ");
  //informationString = informationString.replace("\n", " ");
  logChannels.synthesized.forEach((_chId) => {
    sentChannelIds.push(
      Util.send(
        _chId,
        `${channelTags}：${title} <${[...information.keys()].join(", ")}>  [${Util.getTime()}]`
      ).catch(console.log)
    );
  });
  return Promise.all(sentChannelIds);
};
module.exports.log = log;

const Type = {
  START_UP: Symbol("StartUp"),
  ERROR: Symbol("Error"),
  COMMAND: Symbol("Command"),
  API: Symbol("Api"),
  DATABASE: Symbol("Database"),
};
module.exports.Type = Type;
//log({type: Type.COMMAND, message:{content:"test", guild:{name:"a"}, channel:{name:"a"}, id:0}}) = errlog;
