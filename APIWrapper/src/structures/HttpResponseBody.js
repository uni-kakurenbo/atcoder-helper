"use strict";

const { mix } = require("mixwith");

const { ModifiableStructure } = require("./mixins/ModifiableStructure");

class HttpResponseBody extends mix(String).with(ModifiableStructure) {
  constructor(url, data) {
    super(data);

    this.url = url;
  }
}

module.exports = { HttpResponseBody };
