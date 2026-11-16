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
        const isToggle = ["on", "off"].includes(match);
        const status = isToggle ? (match === "on" ? "true" : "false") : mention.status;
        const msg = isToggle ? mention.message : match;
        if (!msg.trim() && !isToggle) return await message.reply('_Invalid mention message! Please provide valid text._');        
        const update = await setData(message.user.id, msg, status, "mention");
        if (!update) return await message.reply('_Error in updating_');
        if (match === "on") return await message.reply('_Mention is now *ON* ✅_');
        if (match === "off") return await message.reply('_Mention is now *OFF* ❌_');
        return await message.reply('_Mention message updated !_');
    }
    const state = mention.status === "true" ? "ON ✅" : "OFF ❌";
    return await message.reply(`_Mention is currently *${state}*_\n\n_Use:_\n_.mention on_\n_.mention off_\n_.mention get_\n_.mention your text_`);
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
