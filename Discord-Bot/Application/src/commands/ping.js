"use strict";

const { Discord, Collection } = require("discord.js");
const { client } = require("../config.js");

const { API } = require("../system");
const {
  Database: { BaseDatabaseAccessor },
} = require("../system");
const { Util } = require("../utils");

const INLINE_FIELD_INDEXES = [1, 2];

module.exports = async function* (_details) {
  const results = new Collection();
  results.set(
    "GENERAL",
    new Collection()
      .set("Discord_GatewayAPI [WebSocket]", client.ws.ping)
      .set("CommandReceiving", new Date() - this.from.createdAt)
  );

  if (_details) {
    results.set("API").set("DATABASE");
    {
      const values = new Collection();
      const startsAt = new Date();
      await Promise.all([
        API.connectWolframAlpha()
          .then(() => values.set("WolframAlpha", new Date() - startsAt))
          .catch(console.log),
        API.googleTranslate()
          .then(() => values.set("GoogleTranslate", new Date() - startsAt))
          .catch(console.log),
        API.searchWikipedia()
          .then(() => values.set("Wikipedia", new Date() - startsAt))
          .catch(console.log),
        API.gmail("ping")
          .then(() => values.set("Gmail", new Date() - startsAt))
          .catch(console.log),
        db_ping(),
      ]);
      results.set("API", values);
    }

    async function db_ping() {
      const values = new Collection();
      const startsAt = new Date();
      const body = await BaseDatabaseAccessor.ping(); //.catch(console.log);
      const endsAt = new Date();
      //console.log(body);
      values
        .set("Upstream", body?.result?.timestamp - startsAt)
        .set("Downstream", endsAt - body?.respond_timestamp);
      results.set("DATABASE", values);
    }
  }

  const output = Util.getEmbed(0x00ffff, "Latencies", "In milliseconds");
  let index = 0;
  output.addFields(
    results.map((_values, _type) => {
      let valuesStr = "";
      _values?.forEach((_value, _tag) => {
        if (_tag?.description === "$") valuesStr += "\n";
        else valuesStr += `${_tag}: \`${_value}\n\``;
      });
      return { name: _type, value: valuesStr, inline: INLINE_FIELD_INDEXES.includes(index++) };
    })
  );
  yield { content: "Pong!", embeds: [output] };

  output.fields[0].value += `MessageSending: \`Now measuring...\`\n`;
  let editedAt = new Date();
  const edited = yield { edit: true, message: { embeds: [output] } };
  output.fields[0].value = output.fields[0].value.replace(
    "Now measuring...",
    edited?.editedAt - editedAt
  );

  return { edit: true, message: { embeds: [output] } };
};
