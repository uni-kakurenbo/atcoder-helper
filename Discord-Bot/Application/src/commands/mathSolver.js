"use strict";

const Discord = require("discord.js");
const { client } = require("../config.js");

const { API, PageController } = require("../system");
const { Util } = require("../utils");

module.exports = async function* (formula) {
  const pageController = new PageController({
    title: formula,
    pageLoop: true,
    pageNumber: true,
    authors: [this.from?.user.id],
  });
  function* toEmbed(_response) {
    for (const _pod of _response?.queryresult?.pods) {
      yield {
        embeds: _pod.subpods.map((_subpods) =>
          Util.getEmbed(0x00ffff, _pod.title, _subpods.img.title).setImage(_subpods.img.src)
        ),
      };
    }
  }
  const response = await API.connectWolframAlpha(formula, {
    reinterpret: true,
    translation: true,
  }).catch((res) => {
    pageController.addPages({ embeds: [Util.getEmbed(0x00ff00, "Math", "Status:`Rejected`")] });
  });
  if (response?.queryresult?.success) {
    pageController.addPages(...toEmbed(response));
  } else {
    pageController.addPages({
      embeds: [
        Util.getEmbed(0x00ffff, "The Too Difficult Problem", "I couldn't solve the problem"),
      ],
    });
  }
  //console.log(this.from)
  yield pageController.begin(this.from);
  return { content: "アヴィリアにやらせたのは秘密ね。", ephemeral: true };
};
