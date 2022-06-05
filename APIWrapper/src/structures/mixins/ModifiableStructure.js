"use strict";

const { Mixin } = require("mixwith");

const ModifiableStructure = Mixin(
  (superclass) =>
    class extends superclass {
      _clone() {
        return Object.assign(Object.create(this), this);
      }
      _patch(data) {
        return data;
      }
      _update(data) {
        const clone = this._clone();
        this._patch(data);
        return clone;
      }
    }
);

module.exports = { ModifiableStructure };
