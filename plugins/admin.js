/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const { System } = require("../lib/");
const { isBotAdmins, getAllGroups, isUrl, sleep, extractUrlsFromText } = require("./client/");

System({
    pattern: 'invite',
    fromMe: true,
    type: 'group',
    onlyGroup: true,
    adminAccess: true,
    desc: "Provides the group's invitation link."
}, async (message) => {
    let isadmin = await isBotAdmins(message);
    if (!isadmin) return await message.reply("_I'm not admin_");
    const data = await message.client.groupInviteCode(message.jid);
    return await message.reply(`https://chat.whatsapp.com/${data}`);
});

System({
    pattern: 'revoke',
    fromMe: true,
    type: 'group',
    onlyGroup: true,
    adminAccess: true,
    desc: "Revoke Group invite link.",
}, async (message) => {
    let isadmin = await isBotAdmins(message);
    if (!isadmin) return await message.reply("_I'm not admin_");
    await message.client.groupRevokeInvite(message.jid)
    await message.send('_Revoked_');
});

System({
    pattern: 'join',
    fromMe: true,
    desc: "to join a group",
    type: 'group'
}, async (message, match) => {
    match = (await extractUrlsFromText(match || message.reply_message.text))[0];
    if (!match) return await message.reply('_Enter a valid group link!_');
    if (!isUrl(match)) return await message.send('_Enter a valid group link!_');
    if (!match) return await message.send('_Enter a valid group link!_');
    if (match && match.includes('chat.whatsapp.com')) {
        const groupCode = match.split('https://chat.whatsapp.com/')[1];
        const joinResult = await message.client.groupAcceptInvite(groupCode);
        if (joinResult) return await message.reply('_Joined!_'); 
        await message.reply('_Invalid Group Link!_'); 
    } else {
        await message.reply('_Invalid Group Link!_'); 
    }
});

System({
    pattern: 'left',
    fromMe: true,
    type: 'group',
    onlyGroup: true,
    desc: 'Left from group'
}, async (message) => {
    await message.client.groupLeave(message.jid);
});

System({
    pattern: 'gjid',
    fromMe: true,
    type: 'group',
    desc: "To get group jid"
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!message.isGroup || match === "info") return message.send(`*All Group Jid*\n${await getAllGroups(message.client)}`);    
    if (match === "participants jid") {
        const { participants, subject } = await message.client.groupMetadata(message.jid);
        const participantJids = participants.map(u => u.id).join("\n\n")
        return message.reply(`*Group Participants Jid*\n\n*Group Name:* ${subject}\n*All Participants Jid*\n\n${participantJids}`);
    };
    await message.send("\n*Group Jid Info 🎏*\n", { values: [ { displayText: "*All Group Info*", id: "gjid info" }, { displayText: "*Group Participants Jid*", id: "gjid participants jid" } ], withPrefix: true, participates: [message.sender] }, "poll");
});

System({
    pattern: 'ginfo',
    fromMe: true,
    type: 'group',
    desc: 'Shows group invite info',
}, async (message, match) => {
    match = (await extractUrlsFromText(match || message.reply_message.text))[0];
    if (!match && message.isGroup) match = `https://chat.whatsapp.com/${await message.client.groupInviteCode(message.jid)}`;
    if (!match) return await message.reply('*Need Group Link*\n_Example : ginfo group link_')
    const [link, invite] = match.match(/chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i) || []
    if (!invite) return await message.reply('*Invalid invite link*');
    const response = await message.groupInviteInfo(invite);
    if (!response) return await message.reply('*Invalid invite link*');
    const profile = await message.getPP(response.id);
    await message.send(profile, { caption: "id: " + response.id + "\nsubject: " + response.subject + "\nowner: " + `${response.owner ? response.owner.split('@')[0] : 'unknown'}` + "\nsize: " + response.size + "\nrestrict: " + response.restrict + "\nannounce: " + response.announce + "\ncreation: " + require('moment-timezone')(response.creation * 1000).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm:ss') + "\ndesc: " + response.desc }, "image");
})

System({
    pattern: "glist",
    fromMe: true,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: 'list group join requests'
}, async (message, match) => {
    const result = await message.client.groupRequestParticipantsList(message.jid);
    if (!result.length) return await message.send('_*no pending requests*_');
    await message.send("*pending requests list*\n\n" + result.map((id) => `+${id.jid.split('@')[0]}`).join('\n'));
});

System({
    pattern: "gapprove",
    fromMe: true,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: 'accept all group join request',
}, async (message, match) => {
    if (!(await isBotAdmins(message))) return await message.send("_I'm not an admin_");
    if (!match) return await message.reply("_Provide a match, e.g., gapprove all or gapprove: 917025673121, 4915147867879_");
    const result = await message.client.groupRequestParticipantsList(message.jid);
    if (!result.length) return await message.send('_*No pending requests*_');
    const jids = match === "all" ? result.map(id => id.jid) : match.split(',').map(num => num.trim().replace(/\+/g, '').replace(/\s/g, '') + '@s.whatsapp.net').filter(jid => jid !== '@s.whatsapp.net'); 
    for (const jid of jids) {
        if (!result.map(id => id.jid).includes(jid)) return await message.send(`_*+${jid.split('@')[0]} is not required*_`);
        await message.client.groupRequestParticipantsUpdate(message.jid, [jid], 'approve');
        await sleep(800);
    };
    await message.send(match === "all" ? '_*Approved all*_' : '_*Approved selected members*_');
});

System({
    pattern: "greject",
    fromMe: true,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: 'reject all group request',
}, async (message, match) => {
    if (!(await isBotAdmins(message))) return await message.send("_I'm not an admin_");
    if (!match) return await message.reply("_Provide a match, e.g., greject all or greject 917025673121, 4915147867879_");
    const result = await message.client.groupRequestParticipantsList(message.jid);
    if (!result.length) return await message.send('_*No pending requests*_');
    const jids = match === "all" ? result.map(id => id.jid) : match.split(',').map(num => num.trim().replace(/\+/g, '').replace(/\s/g, '') + '@s.whatsapp.net').filter(jid => jid !== '@s.whatsapp.net'); 
    for (const jid of jids) {
        if (!result.map(id => id.jid).includes(jid)) return await message.send(`_*+${jid.split('@')[0]} is not required*_`);
        await message.client.groupRequestParticipantsUpdate(message.jid, [jid], 'reject');
        await sleep(800);
    };
    await message.send(match === "all" ? '_*Reject all*_' : '_*Reject selected members*_');
});
