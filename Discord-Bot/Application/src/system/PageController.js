"use strict";

const { MessageEmbed, MessageActionRow, MessageButton, Collection } = require("discord.js");
const client = require("../config.js").client;

const { Util } = require("../utils");

const controllers = new Collection();
client.on("interactionCreate", (interaction) => {
  const parentId = interaction?.message?.interaction?.id;
  if (!interaction.isButton() || !controllers.has(parentId)) return;
  controllers.get(parentId).$action(interaction);
});

class PageController {
  constructor({
    startPage = 0,
    firstPageNumber = 1,
    title = null,
    endMessage = {},
    pageLoop = false,
    pageNumber = false,
    displayPageNumberEmbeds = "last",
    authors,
  } = {}) {
    this.authors = authors;
    this.pageCount = startPage;
    this.firstPageNumber = firstPageNumber;
    this.title = title;
    this.endMessage = endMessage;
    this.pageLoop = pageLoop;
    this.pageNumber = pageNumber;
    this.displayPageNumberEmbeds = displayPageNumberEmbeds;

    //console.log(this)
    this.pages = [];
  }

  #getButtons(_disabled = false) {
    return new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("left")
          .setLabel("◀")
          .setStyle("PRIMARY")
          .setDisabled(_disabled)
        //.setCustomId("left").setStyle("PRIMARY").setEmoji("◀").setDisabled(_disabled)
      )
      .addComponents(
        new MessageButton()
          .setCustomId("right")
          .setLabel("▶")
          .setStyle("PRIMARY")
          .setDisabled(_disabled)
        //.setCustomId("right").setStyle("PRIMARY").setEmoji("▶️").setDisabled(_disabled)
      )
      .addComponents(
        new MessageButton()
          .setCustomId("stop")
          .setLabel("■")
          .setStyle("DANGER")
          .setDisabled(_disabled)
      );
  }

  #getPageDisplayers(_length) {
    switch (this.displayPageNumberEmbeds) {
      case "all":
        return Util.range(0, _length);
        break;
      case "last":
        return [_length - 1];
        break;
      default:
        if (this.displayPageNumberEmbeds.constructor == Number) {
          return [this.displayPageNumberEmbeds];
        } else {
          return this.displayPageNumberEmbeds;
        }
    }
  }

  #assignPageNumber(_message, _pageNumber, _displayers) {
    if (this.pageNumber) {
      return _displayers.forEach((_index) => {
        //console.log(_index, _message)
        _message?.embeds[_index].setFooter({
          text: `#${String(_pageNumber)}/${String(this.pages.length + this.firstPageNumber - 1)}`,
        });
      });
    }
  }

  async $action(_interaction) {
    //console.log(_interaction)
    //if (!_interaction.isButton() || _interaction?.message.interaction.id != this.from.id) return;
    if (this.authors?.constructor == Array && !this.authors?.includes(_interaction.user.id)) {
      _interaction.deferUpdate();
      return;
    }
    switch (_interaction.customId) {
      case "left":
        this.pageCount--;
        break;
      case "right":
        this.pageCount++;
        break;
      case "stop":
        await _interaction.update(
          Object.assign({}, this.endMessage, { components: [this.#getButtons(true)] })
        );
        controllers.delete(this.from.id);
        return;
      default:
        return;
    }
    if (this.pageCount < 0) {
      this.pageCount = 0;
      if (this.pageLoop) {
        this.pageCount = this.pages.length - 1;
      }
    }
    if (this.pageCount >= this.pages.length) {
      this.pageCount = this.pages.length - 1;
      if (this.pageLoop) {
        this.pageCount = 0;
      }
    }

    const page = this.pages[this.pageCount];

    let message = {};

    message.components = (page?.components ?? []).concat();
    message.components.unshift(this.#getButtons());
    message.embeds = page.embeds;

    this.#assignPageNumber(
      message,
      this.pageCount + this.firstPageNumber,
      this.#getPageDisplayers(message.embeds.length)
    );

    await _interaction.update(message).catch(console.log);
  }

  begin(from) {
    this.from = from;
    const page = this.pages[this.pageCount];

    let message = {};

    message.components = (page?.components ?? []).slice();
    message.components.unshift(this.#getButtons());
    message.embeds = page.embeds;

    this.#assignPageNumber(
      message,
      this.pageCount + this.firstPageNumber,
      this.#getPageDisplayers(message.embeds.length)
    );
    if (this.title) {
      message.content = this.title;
    }
    //console.log(from)
    controllers.set(from.id, this);
    //console.log(controllers)
    return message;
  }

  addPages(..._pages) {
    this.pages.push(..._pages);
    //console.log(this.pages);
  }
  deletePages(_start, _count) {
    this.pages.splice(_start, _count);
  }
}

module.exports = {
  PageController,
};
