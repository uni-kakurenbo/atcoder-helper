"use strict";

return;
const {
  API: { fetch },
} = require("../system");

(async () => {
  const list = await fetch("get", ``);
  console.log("gmail:", list);
})();
