/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, isPrivate, mediafireDl } = require("../lib/");
const { extractUrlsFromText } = require('./client/');

System({
    pattern: "mediafire",
    fromMe: isPrivate,
    desc: "MediaFire downloader",
    type: "download"
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply("_Provide a MediaFire URL._");
    const mediafireUrl = (await extractUrlsFromText(match))[0];
    if (!mediafireUrl || !mediafireUrl.includes("mediafire")) return await message.reply("_It's not a valid MediaFire URL._");
    const result = await mediafireDl(mediafireUrl);
    for (const documentData of result) {
        const downloadMessage = await message.reply(`_*Downloading --> ${documentData.name}*_`);
        await message.send({
            url: documentData.link
        }, {
            mimetype: documentData.mime,
            fileName: documentData.name,
            fileSize: documentData.size,
            quoted: downloadMessage
        }, "document");
        await downloadMessage.edit("_*Download complete!*_");
    }
    return message;
});
