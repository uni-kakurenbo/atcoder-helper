"use strict";

const Discord = require("discord.js");
const { client } = require("../config.js");

const fs = require("fs").promises;
const path = require("path");
const parse = require("csv-parse/lib/sync");

const { API } = require("../system");
const functions = require("../functions.js");

module.exports.execute = async function (_text, _to, _from) {
  //アロー関数は不可
  const output = await API.googleTranslate(_text, _to, _from ?? null).catch(console.log);
  return { content: _text, embeds: [functions.getEmbed(0x00ffff, `to ${_to}`, output.text)] };
};

module.exports.getLanguages = async function (_maxLength = 25) {
  const languageCodes = await fs.readFile(
    path.relative(process.cwd(), `${__dirname}/../assets/languageCodes.csv`),
    "utf-8"
  );
  const data = await parse(languageCodes, {
    columns: true,
    ltrim: true,
    rtrim: true,
    escape: "\\",
  });
  const languages = data
    .sort((a, b) => {
      const _a = Number(a.priority);
      const _b = Number(b.priority);
      if (isNaN(_a) && !isNaN(_b)) {
        return 1;
      } else if (!isNaN(_a) && isNaN(_b)) {
        return -1;
      } else if (isNaN(_a) && isNaN(_b)) {
        return 0;
      }
      return _a - _b;
    })
    .filter((_datum, _index) => _index < _maxLength)
    .map((_datum) => {
      return { name: `${_datum.ja_name}/${_datum.en_name}`, value: _datum.code };
    });
  return languages;
};
