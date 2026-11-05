/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, isPrivate, bot } = require("../lib/");  

System({
    pattern: "(ping|speed)",
    fromMe: isPrivate,
    type: "misc",
    desc: "To check ping",
    adminAccess: true,
}, async (message) => {
    const start = new Date().getTime();
    const ping = await message.send("*𝆺𝅥 running 𝆺𝅥*");
    const end = new Date().getTime();
    return await ping.edit("*☇ ꜱᴩᷨᴇͦᴇͭᴅ ☁ :* " + (end - start) + " *ᴍꜱ* ");
});

System({
    pattern: "(vv|view)",
    fromMe: true,
    type: "whatsapp",
    desc: "get view ones message"
}, async (message) => {
   if (!message.reply_message.viewones) return await message.reply("_*Reply to a view once*_");
   return await message.client.forwardMessage(message.chat, message.reply_message.message, { readViewOnce: true });
});

System({
   pattern: "reboot",
   fromMe: true,
   desc: "to reboot your bot",
   type: "server",
}, async (message, match) => {
    await message.reply('_Rebooting..._')
    bot.restart();
});