"use strict";

const { register } = require("./ErrorHandler");

const Messages = {
  CLIENT_INVALID_OPTION: (prop, must) => `The ${prop} option must be ${must}`,

  USERNAME_INVALID: "An invalid username was provided.",
  PASSWORD_INVALID: "An invalid password was provided.",

  REQUEST_INVALID: (error) => error,
  RESPONSE_ERRORED: (error) => error,

  LOGIN_REJECTED: (username) =>
    `Could not access the AtCoder account (${username}): An incorrect password might be provided.`,
  MISSING_ACCESS: (username) =>
    `A valid session could not be obtained for accessing the AtCoder account (${username}).`,
  LOGIN_FILED: (username) =>
    `Log-in to provided AtCoder account (${username}) did not complete successfully due to an unknown error.`,

  NOT_LOGGED_IN: (username) => `Already be logged out from the AtCoder account (${username}).`,

  FETCH_REJECTED: "The fetch request was rejected.",

  NOT_IMPLEMENTED: (what, name) => `Method ${what} not implemented on ${name}.`,

  ARG_MISSING: (name) => `Missing argument: ${name}`,
};

for (const [name, message] of Object.entries(Messages)) register(name, message);

module.exports = { Messages };
