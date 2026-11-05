const lib = require("../lib/");
const util = require("util");
const bs = require('../lib/bailys');
const func = require("./client/");

lib.System({
  pattern: 'eval',
  on: "text",
  fromDev: true,
  desc: 'Runs a server code',
  dontAddCommandList: true,
}, async (message, match, client) => {
  var m = message;
  if (message.body.startsWith(">")) {
    try {
      let evaled = await eval(`(async () => { ${message.body.replace(">", "")} })()`);
      if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
      await message.reply(evaled);
    } catch (err) {
      await message.reply(util.format(err));
    }
  }
});