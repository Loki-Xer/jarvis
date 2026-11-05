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


System({
    pattern: 'welcome',
    type: 'greetings',
    fromMe: true,
    onlyGroup: true,
    adminAccess: true,
    desc: 'set welcome message'
}, async (message, match) => {
    if (!await isBotAdmins(message)) return await message.send("_I'm not an admin_");
    const { welcome } = await getData(message.from);
    if (match.toLowerCase() === 'get') {
        if (!welcome || !welcome.message) return await message.send('*_Not Set Yet_*');
        return await message.send(welcome.message);
    } else if (match.toLowerCase() === 'off') {
        const status = welcome && welcome.status ? welcome.status : 'false';
        if (status === 'false') return await message.send(`_already deactivated_`);
        await setData(message.jid, welcome.message, 'false', 'welcome');
        return await message.send('*successfully deactivated*');
    } else if (match.toLowerCase() === 'on') {
        const status = welcome && welcome.status ? welcome.status : 'false';
        if (status === 'true') return await message.send(`_already activated_`);
        await setData(message.jid, welcome.message, 'true', 'welcome');
        return await message.send('*successfully activated*');
    } else if (match) {
        const status = welcome && welcome.status ? welcome.status : 'true';
        await setData(message.jid, match, status, 'welcome');
        return await message.send('*successfully set*');
    }
    return await message.reply('_*welcome get*_\n_*welcome* thank you for joining &mention_\n*_welcome false_*');
});

System({
    pattern: 'goodbye',
    type: 'greetings',
    fromMe: true,
    onlyGroup: true,
    adminAccess: true,
    desc: 'set goodbye message'
}, async (message, match) => {
    if (!await isBotAdmins(message)) return await message.send("_I'm not an admin_");
    const { exit } = await getData(message.jid);
    if (match.toLowerCase() === 'get') {
        if (!exit || !exit.message) return await message.send('*_Not Set Yet_*');
        return await message.send(exit.message);
    } else if (match.toLowerCase() === 'off') {
        const status = exit && exit.status ? exit.status : 'false';
        if (status === 'false') return await message.send(`_already deactivated_`);
        await setData(message.jid, exit.message, 'false', 'exit');
        return await message.send('*successfully deactivated*');
    } else if (match.toLowerCase() === 'on') {
        const status = exit && exit.status ? exit.status : 'false';
        if (status === 'true') return await message.send(`_already activated_`);
        await setData(message.jid, exit.message, 'true', 'exit');
        return await message.send('*successfully activated*');
    } else if (match) {
        const status = exit && exit.status ? exit.status : 'true';
        await setData(message.jid, match, status, 'exit');
        return await message.send('*successfully set*');
    }
    return await message.reply('_*goodbye get*_\n_*goodbye* thank you for joining &mention_\n*_goodbye false_*');
});

System({
    pattern: "pdm",
    fromMe: true,
    type: "manage",
    onlyGroup: true,
    adminAccess: true,
    desc: "To get info about promot and demote"
}, async (message, match) => {
    if (!await isBotAdmins(message)) return await message.send("_I'm not an admin_");
    if (match === "on") { 
        await setData(message.jid, "active", "true", "pdm");
        return await message.send("_*activated*_");
    } else if (match === "off") {
        await setData(message.jid, "disactive", "false", "pdm");
        return await message.send("_*deactivated*_");
    } else {
        await message.send("\n*Choose a setting to pdm settings*\n", { values: [ { displayText: "*on*", id: "pdm on" }, { displayText: "*off*", id: "pdm off" } ], withPrefix: true, participates: [message.sender] }, "poll");
    }
});

System({
    pattern: "gcaccess",
    fromMe: true,
    type: "manage",
    onlyGroup: true,
    adminAccess: true,
    desc: "To give access to group cmds"
}, async (message, match) => {
    if (!await isBotAdmins(message)) return await message.send("_I'm not an admin_");
    if (match === "on") { 
        await setData(message.jid, "active", "true", "adminAccess");
        return await message.send("_*activated*_");
    } else if (match === "off") {
        await setData(message.jid, "disactive", "false", "adminAccess");
        return await message.send("_*deactivated*_");
    } else {
        await message.send("\n*Choose a option to set admin access to this group*\n", { values: [ { displayText: "*on*", id: "gcaccess on" }, { displayText: "*off*", id: "gcaccess off" } ], withPrefix: true, participates: [message.sender] }, "poll");
    }
});
