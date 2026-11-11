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
const { isBotAdmins } = require("./client/");
const actions = ['kick','null'];


System({
    pattern: 'antigstatus',
    type: "manage",
    fromMe: true,
    onlyGroup: true,
    adminAccess: true,
    desc: 'remove users who add group status'
}, async (message, match) => {
    if (!await isBotAdmins(message)) return await message.send("_I'm not an admin_");
    if (!match) return await message.reply("_*antigstatus* on/off_\n_*antigstatus* action kick/null_");
    const { antigstatus } = await getData(message.chat)
    if(match.toLowerCase() === 'on') {
        const action = antigstatus && antigstatus.message ? antigstatus.message : 'null';
        await setData(message.jid, action, "true", "antigstatus");
        return await message.send(`_Antigstatus Activated with action null_\n_*antigstatus action* kick/null for chaning actions_`)
    } else if(match.toLowerCase() === 'off') {
        const action = antigstatus && antigstatus.message ? antigstatus.message : 'null';
        await setData(message.jid, action, "false", "antigstatus");
        return await message.send(`_Antigstatus deactivated_`)
    } else if(match.toLowerCase().match('action')) {
        const status = antigstatus && antigstatus.status ? antigstatus.status : 'true';
        match = match.replace(/action/gi,'').trim();
        if(!actions.includes(match)) return await message.send('_action must be kick or null_')
        await setData(message.jid, match, status, "antigstatus");
        return await message.send(`_Antigstatus Action Updated_`);
    }
});