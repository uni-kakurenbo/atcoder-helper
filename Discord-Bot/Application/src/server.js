"use strict";

const express = require("express");
const app = express();

app.listen("3000", () => {
  console.setColor("blue").log("Application started");
});

app.use("/documents", express.static("docs"));

//BOT
require("./bot.js");
