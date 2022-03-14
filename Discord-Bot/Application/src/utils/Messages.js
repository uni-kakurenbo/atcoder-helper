"user strict";

const functions = require("../functions.js");
const Colors = require("./Colors.js");

module.exports.Embed = {
  INVALID_USER: functions.getEmbed(
    Colors.WRONG_ANSWER,
    "Invalid User",
    "An invalid username was provided."
  ),
};
