/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const {
    bot,
    System,
    getData,
    setData
} = require("../lib/");
const { isBotAdmins, sleep } = require("./client/");

System({
    pattern: "mute",
    fromMe: true,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: "mute group",
}, async (message) => {
    let isadmin = await isBotAdmins(message);
    if (!isadmin) return await message.reply("_I'm not admin_");
    const mute = await message.reply("_Muting Group_");
    await sleep(500);
    await message.client.groupSettingUpdate(message.jid, "announcement");
    return await mute.edit("_Group Muted successfully_");
});

System({
    pattern: "unmute",
    fromMe: true,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: "unmute group"
}, async (message) => {
    let isadmin = await isBotAdmins(message);
    if (!isadmin) return await message.reply("_I'm not admin_");
    const mute = await message.reply("_Unmuting Group_");
    await sleep(500);
    await message.client.groupSettingUpdate(message.jid, "not_announcement");
    return await mute.edit("_Group Unmuted successfully_");
});

System({
    pattern: 'lock',
    fromMe: true,
    type: 'group',
    onlyGroup: true,
    adminAccess: true,
    desc: "only allow admins to modify the group's settings",
}, async (message, match) => {
    let isadmin = await isBotAdmins(message);
    if (!isadmin) return await message.reply("_I'm not admin_");
    const meta = await message.client.groupMetadata(message.chat)
    if (meta.restrict) return await message.send("_Already only admin can modify group settings_")
    await message.client.groupSettingUpdate(message.jid, 'locked')
    return await message.send("*Only admin can modify group settings*")
});

System({
    pattern: 'unlock',
    fromMe: true,
    type: 'group',	
    onlyGroup: true,
    desc: "allow everyone to modify the group's settings -- like display picture etc.",
}, async (message, match) => {
    let isadmin = await isBotAdmins(message);
    if (!isadmin) return await message.reply("_bot not admin_");
    const meta = await message.client.groupMetadata(message.jid);
    if (!meta.restrict) return await message.send("_Already everyone can modify group settings_")
    await message.client.groupSettingUpdate(message.jid, 'unlocked')
    return await message.send("*Everyone can modify group settings*")
});

System({
    pattern: 'gname',
    fromMe: true,
    type: 'group',
    onlyGroup: true,
    adminAccess: true,
    desc: "To change the group's subject",
}, async (message, match) => {
    match = match || message.reply_message.text
    if (!match) return await message.reply('*Need Subject!*\n*Example: gname New Subject!*.')
    const meta = await message.client.groupMetadata(message.chat);
    if (!meta.restrict) {
        await message.client.groupUpdateSubject(message.chat, match)
        return await message.send("*Subject updated*")
    }
    const isbotAdmin = await isBotAdmins(message);
    if (!isbotAdmin) return await message.reply("I'm not an admin")
    await message.client.groupUpdateSubject(message.chat, match)
    return await message.send("*Subject updated*")
});

System({
    pattern: 'gdesc',
    fromMe: true,
    type: 'group',
    onlyGroup: true,
    adminAccess: true,
    desc: "To change the group's description",
}, async (message, match) => {
    match = match || message.reply_message.text
    if (!match) return await message.reply('*Need Description!*\n*Example: gdesc New Description!*.')
    const meta = await message.client.groupMetadata(message.jid);
    if (!meta.restrict) {
        await message.client.groupUpdateDescription(message.jid, match)
        return await message.send("_*Description updated*_")
    }
    const isbotAdmin = await isBotAdmins(message);
    if (!isbotAdmin) return await message.send("_I'm not an admin_")
    await message.client.groupUpdateDescription(message.jid, match)
    return await message.send("_*Description updated*_")
})

System({
    pattern: "gpp",
    fromMe: true,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: "Set full-screen profile picture",
}, async (message, match) => {
    let isadmin = await isBotAdmins(message);
    if (!isadmin) return await message.reply("_I'm not an admin_");
    if (match && match === "remove") {
        await message.client.removeProfilePicture(message.jid);
        return await message.reply("_Group Profile Picture Removed_");
    }
    if (!message.reply_message?.image) return await message.reply("_Reply to a photo_");
    const media = await message.reply_message.download();
    await message.client.updateProfile(media, message.jid);
    return await message.send("_Group Profile Picture Updated_");
});

System({
    pattern: "gadd",
    fromMe: true,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: "Set who can add members to the group (all / admin)"
}, async (message, match) => {
    if (!await isBotAdmins(message)) return await message.reply("_I'm not admin_");
    match = match?.trim().toLowerCase();
    const modes = { all: "all_member_add", admin: "admin_add", admins: "admin_add" };
    if (!match) {
        return await message.send("\n*Who can add members? 👥*\n", {
            values: [
                { displayText: "*All Members*", id: "gadd all" },
                { displayText: "*Only Admins*", id: "gadd admin" }
            ],
            withPrefix: true,
            participates: [message.sender]
        }, "poll");
    }
    if (!modes[match]) return await message.reply("*Example:*\n_.memberadd all_ (everyone can add)\n_.memberadd admin_ (only admins can add)");
    await message.client.groupMemberAddMode(message.jid, modes[match]);
    return await message.send(match === "all" ? "*Everyone can add members now :)*" : "*Only admins can add members now !*");
});

System({
    pattern: "automute",
    fromMe: true,
    onlyGroup: true,
    type: 'manage',
    adminAccess: true,
    desc: "auto mute groups"
}, async (message, match) => {
    match = match?.toUpperCase();
    const { autoMute } = await getData(message.chat);
    const action = autoMute && autoMute.message ? autoMute.message : 'null';
    if (!match) return await message.send("*Wrong format!*\n *.automute 10:00 PM*\n *.automute 06:00 AM*\n *.automute off*");
    if (match.toLowerCase() === "off") {
        await setData(message.jid, action, "false", "autoMute");
        return await message.send("*Automute has been disabled in this group ❗*");       
    } else if (match.toLowerCase() === "on") {
        await setData(message.jid, action, "true", "autoMute");
        return await message.send("*Automute has been enabled in this group ✅*");       
    };
    var admin = await isBotAdmins(message);
    if (!admin) return await message.send("_I'm not an admin_");
    await setData(message.jid, match, "true", "autoMute");
    await message.send(`*_Group will auto mute at ${match}, rebooting.._*`);
    bot.restart();
});

System({
    pattern: "autounmute",
    fromMe: true,
    type: 'manage',
    onlyGroup: true,
    adminAccess: true,
    desc: "auto mute groups",
}, async (message, match) => {
    match = match?.toUpperCase();
    const { autoUnmute } = await getData(message.chat);
    const action = autoUnmute && autoUnmute.message ? autoUnmute.message : 'null';
    if (!match) return await message.send("*Wrong format!*\n *.autounmute 10:00 PM*\n *.autounmute 06:00 AM*\n *.autounmute off*");
    if (match.toLowerCase() === "off") {
        await setData(message.jid, action, "false", "autoUnmute");
        return await message.send("*Autounmute has been disabled in this group ❗*");       
    } else if (match.toLowerCase() === "on") {
        await setData(message.jid, action, "true", "autoUnmute");
        return await message.send("*Autounmute has been enabled in this group ✅*");       
    };
    var admin = await isBotAdmins(message);
    if (!admin) return await message.send("_I'm not an admin_");
    await setData(message.jid, match, "true", "autoUnmute");
    await message.send(`*_Group will auto unmute at ${match}, rebooting.._*`)
    bot.restart();
});

System({
    pattern: "getmute",
    fromMe: true,
    type: 'manage',
    onlyGroup: true,
    adminAccess: true,
    desc: "mute/unmute group info"
}, async (message, match) => {
    const { autoMute, autoUnmute } = await getData(message.jid);
    if ((!autoMute || autoMute.status === "false") && (!autoUnmute || autoUnmute.status === "false")) return message.reply("*Auto mute and Auto unmute not set yet*");
    let msg = [autoMute?.status === "true" ? `*⬦ Auto Mute Set As:* ${autoMute.message}` : "", autoUnmute?.status === "true" ? `*⬦ Auto Unmute Set As:* ${autoUnmute.message}` : ""].filter(Boolean).join("\n");
    return message.reply("*Scheduled Mutes/Unmutes*\n\n" + msg);
});
