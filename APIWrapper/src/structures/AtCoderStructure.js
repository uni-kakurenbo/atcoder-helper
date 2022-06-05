"use strict";

const { mix } = require("mixwith");

const { Base } = require("./Base");

const { ModifiableStructure } = require("./mixins/ModifiableStructure");
const { IndexableStructure } = require("./mixins/IndexableStructure");

class AtCoderStructure extends mix(Base).with(ModifiableStructure, IndexableStructure) {}

module.exports = { AtCoderStructure };
