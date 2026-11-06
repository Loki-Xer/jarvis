/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const {
    System,
    setData,
    getData
} = require('../lib');
const { parsedJid } = require("./client/");


System({
    pattern: "antidelete",
    fromMe: true,
    type: "manage",
    desc: "Manage anti-delete settings",
}, async (message, match) => {
    if(!match) return await message.reply("*Example:*\n\n_*antidelete on/off*_\n_*antidelete jid/chat/pm*_\n");
    const { antidelete } = await getData(message.user.id);
    if (match === "off") {
        const jid = antidelete && antidelete.message ? antidelete.message : "chat";
        await setData(message.user.id, jid, "false", "antidelete");
        return await message.reply("_*antidelete disabled*_");
    } else if (match === "on") {
        const jid = antidelete && antidelete.message ? antidelete.message : "chat";
        await setData(message.user.id, jid, "true", "antidelete");
        return await message.reply("_*antidelete enabled*_");
    } else {
        const [jid] = await parsedJid(match);
        if (!jid && match !== "chat" && match !== "pm") return await message.reply("*Example:*\n\n_*antidelete on/off*_\n_*antidelete jid/chat/pm*_");
        const status = antidelete?.status || "false";
        await setData(message.user.id, jid || match, status, "antidelete");
        return await message.reply(`_*antidelete set to ${jid || match}*_`);
    }
});


System({
    pattern: "antiviewones",
    fromMe: true,
    type: "manage",
    desc: "To get info about promot and demote"
}, async (message, match) => {
    if(!match) return await message.reply("*Example:*\n\n_*antiviewones on/off*_\n_*antiviewones jid/chat/pm*_\n");
    const { antiviewones } = await getData(message.user.id);
    if (match === "off") {
        const jid = antiviewones && antiviewones.message ? antiviewones.message : "chat";
        await setData(message.user.id, jid, "false", "antiviewones");
        return await message.reply("_*antiviewones disabled*_");
    } else if (match === "on") {
        const jid = antiviewones && antiviewones.message ? antiviewones.message : "chat";
        await setData(message.user.id, jid, "true", "antiviewones");
        return await message.reply("_*antiviewones enabled*_");
    } else {
        const [jid] = await parsedJid(match);
        if (!jid && match !== "chat" && match !== "pm") return await message.reply("*Example:*\n\n_*antiviewones on/off*_\n_*antiviewones jid/chat/pm*_");
        const status = antiviewones?.status || "false";
        await setData(message.user.id, jid || match, status, "antiviewones");
        return await message.reply(`_*antiviewones set to ${jid || match}*_`);
    };
});
