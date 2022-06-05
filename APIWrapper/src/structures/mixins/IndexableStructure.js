"use strict";

const { Mixin } = require("mixwith");

const IndexableStructure = Mixin(
  (superclass) =>
    class extends superclass {
      _makeAssigner(data) {
        return (properties, wrapt, init) => {
          let target, source;
          if (Array.isArray(properties)) {
            [target, source = target] = properties;
          } else {
            target = source = properties;
          }
          wrapt ??= data[source];

          if (source in data) {
            this[target] = wrapt;
          } else if (init !== void 0) {
            this[target] = init;
          }
        };
      }
      valueOf() {
        return this.id;
      }
    }
);

module.exports = { IndexableStructure };
