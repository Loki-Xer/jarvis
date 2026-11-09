/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/



const { System } = require("../lib/");
const { extractUrlsFromText } = require("./client/");

System({
    pattern: 'cinfo',
    fromMe: true,
    type: 'group',
    desc: 'Shows channel invite info',
}, async (message, match) => {
    match = (await extractUrlsFromText(match || message.reply_message.text))[0];
    if (!match && message.jid.endsWith('@newsletter')) match = message.jid;
    if (!match) return await message.reply('*Need Channel Link*\n_Example : cinfo channel link_');
    const [link, invite] = match.match(/whatsapp.com\/channel\/([0-9A-Za-z_-]+)/i) || [];
    if (!invite && !match.endsWith('@newsletter')) return await message.reply('*Invalid channel link*');
    const response = await message.client.newsletterMetadata(invite ? "invite" : "jid", invite || match).catch(() => null);
    if (!response || !response.id) return await message.reply('*Invalid channel link*');
    const meta = response.thread_metadata || response;
    const name = response.name || meta.name?.text;
    const desc = response.description || meta.description?.text;
    const subs = response.subscribers ?? meta.subscribers_count;
    const created = response.creation_time || meta.creation_time;
    const pic = (meta.picture || meta.preview || response.picture || response.preview)?.direct_path;
    const caption = "id: " + response.id + "\nname: " + name + "\nsubscribers: " + subs + "\nverified: " + (meta.verification || response.verification) + "\nstate: " + (response.state?.type || response.state) + "\ncreation: " + (created ? require('moment-timezone')(created * 1000).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm:ss') : 'unknown') + "\nlink: https://whatsapp.com/channel/" + (meta.invite || response.invite || invite) + "\ndesc: " + desc;
    if (!pic) return await message.reply(caption);
    return await message.send("https://pps.whatsapp.net" + pic, { caption }, "image");
});
