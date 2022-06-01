"use strict";

const { BaseResolver } = require("./BaseResolver");
const { HttpResponseBody } = require("../structures/HttpResponseBody");

class HttpResponseResolver extends BaseResolver {
  constructor() {
    super(HttpResponseBody);
  }
  resolveUrl(...urlOrInstances) {
    let res = null;
    urlOrInstances.forEach((urlOrInstance) => {
      res ??=
        super.resolveByPropertyName("url", urlOrInstance) ??
        super.resolveByPropertyName("url", urlOrInstance?.config?.url);
    });
    return res;
  }
}

module.exports = { HttpResponseResolver };
