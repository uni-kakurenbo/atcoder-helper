"use strict";

const { User } = require("./User");

class ClientUser extends User {
  constructor(client, username, data) {
    super(client, { username: username, ...data });
  }
}

module.exports = { ClientUser };
