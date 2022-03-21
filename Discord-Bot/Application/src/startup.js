"use strict";

const { client: AtCoderClient } = require("../../../APIWrapper/src");

const atcoder = new AtCoderClient();

atcoder.on("contestComingUp_15s", require("./commands/contestNotification.js").notify);
