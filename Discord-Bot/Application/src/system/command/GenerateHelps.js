"use strict";

const { Collection, MessageEmbed } = require("discord.js");

class CommandArgument extends Collection {
  constructor(_options) {
    super();
    Object.defineProperty(this, "name", { value: _options.name });
    ["type", "description", "choices", "default"].forEach((_key) => {
      this.set(_key, _options[_key]);
    });
    this.set("comment", _options.comment ?? _options.description).set(
      "required",
      _options.required ?? false
    );
  }

  toString({ _comment = false } = {}) {
    let string = `${this.name}`;
    if (!this.get("required")) string = `_${string}_`;

    string += ` [${this.get("type")}]`;
    const defaultValue = this.get("default");
    if (defaultValue) string += ` (${defaultValue})`;

    if (_comment) string += `\n> ${this.get("comment")}`;

    return string;
  }
}

class CommandInfomation extends Collection {
  constructor(_name, _data) {
    super();
    Object.defineProperty(this, "name", { value: _name });
    ["description", "comment"].forEach((_key) => {
      this.set(_key, _data[_key]);
    });
    this.set("comment", _data.comment ?? _data.description).set(
      "options",
      _data.options?.map((_option) => new CommandArgument(_option))
    );
    //console.log(this.toString());
  }

  toString() {
    let string = "";
    string += this.get("comment") + "\n";
    const options = this.get("options");
    if (options) options.forEach((_option) => (string += `・${_option.toString()}\n`));
    return string;
  }
}

class CommandHelp extends Collection {
  constructor(_commands) {
    super();
    console.log(_commands);
    _commands.forEach((_command) => {
      //console.log(_command)
      this.set(_command.name, _command);
    });
    this.sort((a, b) => (a.name > b.name ? 1 : -1));
    //console.log(this.toEmbed());
  }
  static get [Symbol.species]() {
    return Collection;
  }

  toEmbeds({ split = 25 } = {}) {
    return this.split(split).map((_page) => {
      return new MessageEmbed().addFields(
        _page.map((_command) => {
          return {
            name: _command.name,
            value: _command.toString(),
            inline: true,
          };
        })
      );
    });
  }
}
