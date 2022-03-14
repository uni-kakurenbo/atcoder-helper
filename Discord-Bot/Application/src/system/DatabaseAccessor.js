"use strict";

const { fetch } = require("./API.js");
const {
  Util: { isObject },
} = require("../utils");

class BaseDatabaseAccessor {
  constructor(type, { name = "" } = {}) {
    Object.defineProperties(this, {
      type: { value: type },
      name: { value: name },
    });
  }
  static apiEndpoint =
    "https://script.google.com/macros/s/AKfycbyLZGboU6rYLPTx_JGIANAztRYlyjtGBLIQ2IYPhhLIcOA0UuQZ2CHANow9trvO2xH_/exec";

  #getBaseBody(_action = "ping") {
    return {
      action: _action,
      type: this.type,
      name: this.name,
    };
  }

  static ping() {
    return fetch("post", this.apiEndpoint, { data: { action: "ping" } });
  }

  put(_object) {
    return fetch("post", BaseDatabaseAccessor.apiEndpoint, {
      data: {
        ...this.#getBaseBody("set"),
        data: _object,
      },
    });
  }
  get(..._keys) {
    _keys.flat();
    return fetch("post", BaseDatabaseAccessor.apiEndpoint, {
      data: {
        ...this.#getBaseBody("get"),
        data: _keys.flat(Infinity),
      },
    });
  }
  delete(_keys, { _getting = false } = {}) {
    return fetch("post", BaseDatabaseAccessor.apiEndpoint, {
      data: {
        ...this.#getBaseBody("delete"),
        keys: _keys.flat(Infinity),
        getting: _getting,
      },
    });
  }
  getKeys() {
    return fetch("post", BaseDatabaseAccessor.apiEndpoint, {
      data: {
        ...this.#getBaseBody("getKeys"),
      },
    });
  }

  create(_columns) {
    return fetch("post", BaseDatabaseAccessor.apiEndpoint, {
      data: {
        ...this.#getBaseBody("create"),
        columns: _columns.flat(Infinity),
      },
    });
  }
  destroy() {
    return fetch("post", BaseDatabaseAccessor.apiEndpoint, {
      data: {
        ...this.#getBaseBody("destroy"),
      },
    });
  }

  appendRecord(_key, ..._data) {
    return fetch("post", BaseDatabaseAccessor.apiEndpoint, {
      data: {
        ...this.#getBaseBody("appendRecord"),
        key: _key,
        data: _data.flat(Infinity),
      },
    });
  }
  appendRecords(_data = {}) {
    return fetch("post", BaseDatabaseAccessor.apiEndpoint, {
      data: {
        ...this.#getBaseBody("appendRecords"),
        data: _data,
      },
    });
  }
}

class Table {
  #begun = false;
  #table;
  constructor(_name) {
    this.#table = new BaseDatabaseAccessor("table", { name: _name });
  }
  async begin(..._columns) {
    await this.#table.create(_columns);
    this.#begun = true;
    return this;
  }
  async destroy(..._options) {
    this.#checkBegun();
    await this.#table.getKeys(..._options);
    this.#begun = false;
    return this;
  }

  async append(..._options) {
    this.#checkBegun();
    if (_options.every((_option) => typeof _option === "string")) {
      await this.#table.appendRecord(..._options);
    } else if (isObject(_options[0])) {
      await this.#table.appendRecords(_options);
    } else {
      throw new Error("Invalid data");
    }
    return this;
  }

  async delete(..._options) {
    this.#checkBegun();
    await this.#table.delete(..._options);
    return this;
  }
  async *keys() {
    this.#checkBegun();
    const { result } = await this.#table.getKeys();
    yield* result;
  }

  #checkBegun() {
    if (this.#begun) return;
    throw new DatabaseError("The .begin() method must be called first.");
  }
}

module.exports = { BaseDatabaseAccessor, Table };

return;
console.log("database test");
const table = new Table("talk");
(async () => {
  await table.begin();
  await table.append("test", "てすとつー");
})();
