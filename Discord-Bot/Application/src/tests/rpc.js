"use strict";

return;
const RPC = require("discord-rpc");

const rpc = new RPC.Client({ transport: "ipc" });

rpc.on("ready", () => {
  rpc.setActivity({
    details: "details",
    state: "state",
    startTimestamp: new Date(),
  });
});
// Log in to RPC with client id
rpc.login({ clientId: "687599949093011495" });
