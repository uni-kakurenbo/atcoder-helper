"use strict";

const { Constants } = require("../configs/Constants");

class DefaultOptions extends null {
  static Client = {};

  static REST = {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Encoding": "gzip",
      Cookie: "",
    },
    timeout: Constants.API.REQUEST_TIMEOUT_MS,
  };
}

module.exports = { DefaultOptions };
