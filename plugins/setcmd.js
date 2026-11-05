/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, setData, database, removeData, removeCmd } = require("../lib/");

System({
    pattern: "setcmd",
    fromMe: true,
    desc: "set a sticker as a cmd",
    type: "manage",
}, async (message, match) => { 
    if (!message.quoted || !message.reply_message.msg || !message.reply_message.msg.fileSha256) return await message.reply('_Reply to an image/video/audio/sticker_'); 
    if (!match) return await message.reply('_Example: setcmd ping_'); 
    const hash = message.reply_message.msg.fileSha256.join("");
    const setcmd = await setData(hash, match, "true", "setCmd");
    if (!setcmd) return await message.reply('_Failed_');
    await message.reply('_Success_');
});

System({
    pattern: 'delcmd',
    fromMe: true,
    desc: 'to delete audio/image/video cmd',
    type: 'manage'
}, async (message, match) => {
    if (!match && !message.quoted) return await message.reply('_Send a cmd name to remove it or reply to an image/video/audio/sticker_');
    if(match) {
	const cmd = await removeCmd(match);
	if(!cmd) return await message.reply('_Failed_');
	return await message.reply('_Success_');
    };
    const hash = message.reply_message.msg.fileSha256.join("");
    if (!hash) return await message.reply('_Failed_');
    const delcmd = await removeData(hash, "setCmd");
    if (!delcmd) return await message.reply('_Failed_');
    await message.reply('_Success_');
});

System({
    pattern: 'listcmd',
    fromMe: true,
    desc: 'to list all commands',
    type: 'manage'
}, async (message, match) => {
    const result = await database.findAll({ where: { name: "setCmd" } });
    if (!result || result.length === 0) return await message.reply("_*No commands set*_");
    const messages = result.map((entry, index) => `_${index + 1}. ${entry.dataValues.message}_`);
    const formattedList = messages.join('\n');
    return await message.reply("*List Cmd*\n\n" + formattedList);
});
