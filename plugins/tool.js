/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, sendAlive, setData, getData, isPrivate, config } = require("../lib/");
const { getUptime, Runtime } = require("./client/");

System({
   pattern: "uptime",
   fromMe: true,
   type: "server",
   desc: "get the running time of the bot"
}, async (message) => {
    const uptime = getUptime();
    if(message.fromMe) return await message.edit(uptime);
    return await message.reply(uptime);
});

System({
   pattern: "runtime",
   fromMe: true,
   desc: "get the delpoyed running time of the bot",
   type: "server",
}, async (m) => {
    const { loginData } = await getData(m.user.number);
    const runtime = await Runtime(loginData.message);
    if(m.fromMe) return await m.edit(runtime);
    m.reply(runtime);
});

System({
    pattern: 'alive',
    fromMe: isPrivate,
    desc: 'Check if the bot is alive',
    type: 'misc'
}, async (message, match) => {
    const { alive } = await getData(message.user.id);
    const data = alive ? alive.message : config.ALIVE_DATA;
    if (match === "get" && message.isOwner) return await message.send(data);
    if (match && message.isOwner) {
        const isUpdated = await setData(message.user.id, match, "true", "alive");
        return await message.send(isUpdated ? "_Alive Message Updated_" : "_Error in updating_");
    };
    return await sendAlive(message, data);
});
