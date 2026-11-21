/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const { System } = require("../lib/");
const { getToggleList, setToggleList, removeDuplicateCmd, restoreCmd } = require("./client/");

const protectedCmds = ["toggle", "plugin", "remove", "restart"];


System({
    pattern: "toggle",
    fromMe: true,
    desc: "Turn off a built-in command so an external plugin can replace it",
    type: "manage",
}, async (message, match) => {
    const name = (match || "").trim().toLowerCase();
    const list = await getToggleList();
    if (!name) {
      if (!list.length) return await message.reply("*Example :*\n\n_*toggle play*_\n\n_*No built-in command removed*_");
      return await message.reply("*Removed built-in commands :*\n\n" + list.map((x) => "• " + x).join("\n"));
    }
    if (protectedCmds.includes(name)) return await message.reply("_*You can't remove " + name + " command*_");
    if (list.includes(name)) {
      await setToggleList(list.filter((x) => x !== name));
      if (restoreCmd(name)) return await message.reply("_*" + name + " command enabled*_");
      return await message.reply("_*" + name + " command will be enabled after restart*_");
    }
    const count = removeDuplicateCmd(name);
    if (!count) return await message.reply("_*" + name + " command not found*_");
    list.push(name);
    await setToggleList(list);
    return await message.reply("_*" + name + " command disabled*_\n_*Use toggle " + name + " to enable it again*_");
});