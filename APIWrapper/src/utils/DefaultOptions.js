"use strict";

const { Constants } = require("../configs/Constants");

class DefaultOptions extends null {
  static Client = {};

  static REST = {
    params: {
      lang: "ja",
    },
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Encoding": "gzip",
      Cookie: "",
    },
    timeout: Constants.API.RequestTimeout,
  };
}

module.exports = { DefaultOptions };
