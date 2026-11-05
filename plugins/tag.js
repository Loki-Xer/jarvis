/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const {
    Vote,
    System,
    isPrivate
} = require("../lib/");

System({
    pattern: "tag",
    fromMe: true,
    type: "group",
    adminAccess: true,
    desc: "mention all users in the group"
}, async (message, match) => {
    if (!message.isGroup) return await message.reply(`@${message.sender.split("@")[0]}`, { mentions: [message.sender], emitOnUpsert: true });   
    const { participants } = await message.client.groupMetadata(message.from).catch(e => {});
    let admins = await participants.filter(v => v.admin !== null).map(v => v.id);
    let msg = "";
    if (match === "all") {
        for (let i = 0; i < participants.length; i++) {
            msg += `${i + 1}. @${participants[i].id.split('@')[0]}\n`;
        }
        await message.send(msg, { mentions: participants.map(a => a.id) });
    } else if (match === "admin" || match === "admins") {
        for (let i = 0; i < admins.length; i++) {
            msg += `${i + 1}. @${admins[i].split('@')[0]}\n`;
        }
        return await message.send(msg, { mentions: admins });
    } else if (match === "everyone") {
        return await message.send('@' + message.from, { contextInfo: { groupMentions: [{ groupJid: message.from, groupSubject: 'everyone' }], mentionedJid: participants?.map(a => a.id) || [] } });
    } else if (match == 'notadmin' || match == 'notadmins' || match == 'not admins' || match == 'not admin' || match == 'non admins' || match == 'non admin') {
        const mentionedJid = participants.filter((user) => !!user.admin != true).map(({ id }) => id)
        mentionedJid.forEach((e) => (msg += `@${e.split('@')[0]}\n`))
        return await message.send(msg.trim(), { contextInfo: { mentionedJid }, });
    } else if (match === "me" || match === "mee") {
        await message.send(`@${message.sender.split("@")[0]}`, { mentions: [message.sender], emitOnUpsert: true });
    } else if (match || message.reply_message.text) {
        match = match || message.reply_message.text;
        if (!match) return await message.reply('*Example :* \n_*tag all*_\n_*tag admin*_\n_*tag text*_\n_*Reply to a message*_');
        await message.send(match, { mentions: participants.map(a => a.id) });
    } else if (message.quoted) {
        return await message.client.forwardMessage(message.jid, message.reply_message.message, { contextInfo: { mentionedJid: participants.map(a => a.id) } });
    } else {
        return await message.reply("*Example :* \n_*tag all*_\n_*tag admin*_\n_*tag me*_\n_*tag text*_\n_*Reply to a message to tag that message*_");
    }
});

System({
    pattern: "vote",
    fromMe: isPrivate,
    type: "group",
    onlyGroup: true,
    adminAccess: true,
    desc: "to send a vote message"
}, async (message, match) => {
    let formattedResult;
    if (!match) return message.reply("*Hey, where's the vote text?* Or you can use: _'vote result'_ or _'vote get'_ to get the result of a vote, _'vote delete'_ to delete a vote message, or _'vote What's your favorite color?;😂|Blue,😟|Red'_ to create a vote.");
    if (match === "delete") {
        if (!message.quoted) return message.reply("_*Reply to a vote message*_");
        const deleted = await Vote(message, {}, "delete");
        if (!deleted) return message.reply("*Vote message not found*");
        await message.send({ key: message.reply_message.data.key }, {}, 'delete');
        await message.reply("*Vote message successfully deleted*");
    } else if (match === "result" || match === "get") {
        if (!message.quoted) return message.reply("_*Reply to a vote message*_");
        const data = await Vote(message, {}, "result");
        if (!data) return message.reply("*It's not a vote message or it's patched*");
        if (data.result.length === 0) {
            formattedResult = ['_*No votes yet.*_'];
        } else {
            formattedResult = data.result.map(({ Emoji, Votes, Percentage, VotesBy, VotedOn }) => {
                const votersList = VotesBy.map(voter => `@${voter.split("@")[0]}`).join('\n');
                return `*Emoji*: ${Emoji}\n*Voted On*: ${VotedOn}\n*Total Votes:* ${Votes}\n*Percentage:* ${Percentage}\n*Votes By:* ${votersList}\n\n`;
            });
        }
        if (data.result.length > 0) formattedResult.unshift('*Vote Result ✨*\n\n');
        await message.send(formattedResult.join('').trim(), { mentions: data.votersJid })
    } else {
        const regex = /^([^;]*;[^;]*\|[^;]*,[^;]*\|[^;]*)$/;
        if (!regex.test(match)) return message.reply("*The text is not in the correct format. Use* ```What's your favorite color?;😂|Blue,😟|Red```");
        await Vote(message, { text: match }, "vote");
    }
});
