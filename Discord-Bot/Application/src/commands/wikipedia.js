"use strict";

const Discord = require("discord.js");
const { client } = require("../config.js");

const functions = require("../functions.js");
const { API, PageController } = require("../system");

module.exports.search = async function* ({
  word: _word,
  limit: _limit,
  type: _type,
  language: _language = "ja",
}) {
  //.then(_res => {console.log(_res.query.search[0].snippet.replaceHtmlTags("**"))}).catch(console.log)
  let parameters = { action: "query", list: "search", srsearch: _word };
  let title = `『${_word}』`;
  let optionsString = [];
  if (_limit) {
    parameters.srlimit = _limit;
    optionsString.push(`limit:${_limit}`);
  }
  if (_type) {
    parameters.srwhat = _type;
    optionsString.push(`type:${_type}`);
  }
  if (optionsString.length > 0) {
    optionsString = `(${optionsString.join(", ")})`;
    title += optionsString;
  }
  title += ` [${_language}]`;
  //console.log(_word, _limit, _type, parameters)
  const pageController = new PageController({
    title: title,
    pageLoop: true,
    pageNumber: true,
    authors: [this.from?.user.id],
  });
  const response = await API.searchWikipedia(parameters, _language).catch(console.error);
  //console.log(response)
  if (response?.query?.searchinfo?.totalhits) {
    response.query?.search.forEach((_data) => {
      const content = _data.snippet.replaceHtmlEntityReferences().replaceHtmlTags("**");
      //console.log(content)
      pageController.addPages({
        embeds: [
          functions
            .getEmbed(0x00ff00, `Wikipedia : ${_data.title}`, `...${content}...`)
            .setURL(`https://${_language}.wikipedia.org/wiki/${encodeURIComponent(_data.title)}`)
            .setTimestamp(new Date(_data.timestamp)),
        ],
      });
    });
  } else {
    pageController.addPages({
      embeds: [functions.getEmbed(0x00ff00, "Wikipedia", "Couldn't Find")],
    });
  }
  //console.log(pageController)
  //console.log(this.from)
  yield pageController.begin(this.from);
  return { content: "ってイレイナさんが言ってた。", ephemeral: true };
};
