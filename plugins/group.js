/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const {
    System,
    config,
    isPrivate,
    warnMessage
} = require("../lib/");
const { parsedJid, isAdmin, isBotAdmins } = require("./client/");

System({
    pattern: 'add',
    type: 'group',
    fromMe: true,
    onlyGroup: true,
    desc: "add a person to group"
}, async (message, match) => {
    match = message.reply_message?.sender || match;
    let isadmin = await isBotAdmins(message);
    if (!isadmin) return await message.reply("_I'm not admin_");
    if (!match) return await message.reply("_Reply to user or need number_\n*Example:* .add 919876543210_");
    match = match.replaceAll(' ', '');
    if (match) {
        let users = match.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        let info = await message.client.onWhatsApp(users);
        let ex = info.map((jid) => jid.jid);
        if (!ex.includes(users)) return await message.reply('_*user not found*_');
        const su = await message.client.groupParticipantsUpdate(message.jid, [users], "add");
        if (su[0].status == 403) {
            await message.reply("_Couldn't add. Invite sent!_");
            return await message.sendGroupInviteMessage(users);
        } else if (su[0].status == 408) {
            await message.send(`Couldn't add @${users.split("@")[0]} because they left the group recently. Group invitation sent!`, {
                mentions: [users]
            });
            const code = await message.client.groupInviteCode(message.jid);
            return await message.send(`https://chat.whatsapp.com/${code}`, {}, "text", users);
        } else if (su[0].status == 401) {
            return await message.send(`Couldn't add @${users.split("@")[0]} because they blocked the bot number.`, {
                mentions: [users]
            });
        } else if (su[0].status == 200) {
            return await message.send(`@${users.split("@")[0]}, Added to the group.`, {
                mentions: [users]
            });
        } else if (su[0].status == 409) {
            return await message.send(`@${users.split("@")[0]}, Already in the group.`, {
                mentions: [users]
            });
        } else {
            return await message.reply(JSON.stringify(su));
        }
    }
});


System({
    pattern: "kick",
    fromMe: true,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: "Kicks a person from the group"
}, async (message, match) => {
    match = message.mention?.jid?.[0] || message.reply_message?.sender || match;
    if (!match) return await message.reply("_Reply to someone/mention_\n*Example:* .kick @user or kick all");    
    if (!await isBotAdmins(message)) return await message.send("_I'm not an admin_");
    if (match === "all") {
        let { participants } = await message.client.groupMetadata(message.jid);
        participants = participants.filter(p => p.id !== message.user.jid);       
        await message.reply("_To stop this process, use the restart command_");
        for (let key of participants) {
            const jid = parsedJid(key.id);
            await message.client.groupParticipantsUpdate(message.jid, jid, "remove");
            if (config.KICK_BLOCK) await message.client.updateBlockStatus(jid[0], "block");
            return await message.send(`_@${jid[0].split("@")[0]} kicked successfully_`, { mentions: jid });
        }
    } else {
        const jid = parsedJid(match);
        await message.client.groupParticipantsUpdate(message.jid, jid, "remove");
        if (config.KICK_BLOCK) await message.client.updateBlockStatus(jid[0], "block");
        return await message.send(`_@${jid[0].split("@")[0]} kicked successfully_`, { mentions: jid, });
    }
});

System({
    pattern: "promote",
    fromMe: true,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: "promote a member",
}, async (message, match) => {
    match = message.mention.jid?.[0] || message.reply_message.sender || match
    if (!match) return await message.reply("_Reply to someone/mention_\n*Example:* . promote @user");
    let isadmin = await isBotAdmins(message);
    if (!isadmin) return await message.reply("_I'm not admin_");
    let jid = parsedJid(match);
    await message.client.groupParticipantsUpdate(message.jid, jid, "promote");
    return await message.send(`_@${jid[0].split("@")[0]} promoted as admin successfully_`, { mentions: jid, });
});


System({
    pattern: "demote",
    fromMe: true,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: "demote a member",
}, async (message, match) => {
    match = message.mention.jid?.[0] || message.reply_message.sender || match
    if (!match) return await message.reply("_Reply to someone/mention_\n*Example:* . demote @user");
    let isadmin = await isBotAdmins(message);
    if (!isadmin) return await message.reply("_I'm not admin_");
    let jid = parsedJid(match);
    await message.client.groupParticipantsUpdate(message.jid, jid, "demote");
    return await message.send(`_@${jid[0].split("@")[0]} demoted from admin successfully_`, { mentions: jid });
});

System({
    pattern: "warn",
    fromMe: true,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: "Warn a user",
}, async (message, match) => {
    let users = message.mention?.jid?.length ? [...new Set(message.mention.jid)] : message.reply_message?.sender ? [message.reply_message.sender] : [];
    if (!users.length) return message.reply("_Reply to someone/mention_\n*Example:* . warn @user\n_To reset warn_\n*Example:* .warn reset");
    const isBotAdmin = await isBotAdmins(message);
    if (!isBotAdmin) return await message.reply("_I'm not admin_");
    for (const user of users) {
        const userIsAdmin = await isAdmin(message, user);
        if (userIsAdmin) {
            await message.send(`_user is admin @${user.split("@")[0]}_`, { mentions: jid });
            continue;
        };
        const name = await message.store.getName(user);
        await warnMessage(message, match, user, name);
    };
});

System({
    pattern: "create",
    fromMe: true,
    desc: "to create a group",
    type: "group",
}, async (m, match) => {
    let gName = match || m.pushName;
    if (!m.reply_message.sender) return m.reply("*To create group with someone*\n_Example : . create @user/reply_");
    const group = await m.client.groupCreate(gName, [m.reply_message.sender, m.sender]);
    return await m.send("_Group successfully created_ ");
});

System({
    pattern: "inactive", 
    fromMe: isPrivate,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: "To check inactive users in group", 
}, async (message, match) => {
    const data = await message.store.groupStatus(message.chat, "disactive");
    let inactiveUsers = Array.isArray(data) ? `*Total Inactive Users ${data.length}*\n\n` + data.map((item, index) => `*${index + 1}. User: @${item.jid.split("@")[0]}*\n*Role: ${item.role}*\n\n`).join("") : "_*No inactive users found.*_";
    return await message.send(inactiveUsers.trim(), { mentions: data.map(a => a.jid) || [] });
});


System({
    pattern: "active", 
    fromMe: isPrivate,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: "To check active users in group", 
}, async (message, match) => {
    const data = await message.store.groupStatus(message.jid, "active");
    let activeUsers = Array.isArray(data) ? `*Total Active Users ${data.length}*\n\n` + data.map(item => `*Name: ${item.pushName}*\n*Number: ${item.jid.split("@")[0]}*\n*Total Messages: ${item.messageCount}*\n\n`).join("") : "_*No active users found.*_";
    return await message.send(activeUsers.trim());
});
