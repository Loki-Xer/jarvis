/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const { System } = require("../lib");
const { isBotAdmins } = require("./client/");

System({
    pattern: "dlt",
    fromMe: true,
    type: "whatsapp",
    desc: "Deletes a message",
}, async (message) => {
    if (!message.quoted) return await message.reply("_Reply to a message to delete it!_");
    await message.send(message.reply_message.data.key, {}, "delete");
    await message.delete();
    return message;
});


System({
    pattern: "del",
    fromMe: true,
    onlyGroup: true,
    type: "whatsapp",
    desc: "Deletes a status message",
}, async (message) => {
    if (!await isBotAdmins(message)) return await message.send("_I'm not an admin_");
    if (!message.quoted || !message.reply_message.groupStatus) return await message.reply("_Reply to a status message to delete it !_");
    await message.reply(message.reply_message.data, { groupStatus: message.reply_message.groupStatus  }, "delete");
    await message.reply('_Status deleted successfully!_');
    return message;
});
