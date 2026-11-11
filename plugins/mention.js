/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, setData, getData, sendMention } = require("../lib/");

System({
    pattern: 'mention',
    fromMe: true,
    desc: 'mention',
    type: 'manage'
}, async (message, match) => {
   const { mention = { status: "true", message: "" } } = await getData(message.user.id);
   if (match === "get" && message.isOwner) return await message.send(mention.message || '_*Mention not set yet*_');
   if (match && message.isOwner) {
       const status = match === "on" ? "true" : match === "off" ? "false" : mention.status;
       const msg = ["on", "off"].includes(match) ? mention.message : match;
       if (!msg.trim()) return await message.reply('_Invalid mention message! Please provide valid text._');
       const update = await setData(message.user.id, msg, status, "mention");
       return await message.reply(update ? '_Mention Updated_' : '_Error in updating_');
   };
   return await message.reply("_Check mention format at https://github.com/Loki-Xer/Jarvis-md/wiki_");
});

System({
    on: 'text',
    fromMe: false,
    allowBot: true,
    dontAddCommandList: true,
}, async (msg) => {
	if (msg.mention.isOwner) {
		return await sendMention(msg);
	};
});
