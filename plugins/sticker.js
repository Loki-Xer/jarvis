/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const { cropToCircle, createRoundSticker, cropImage, AddMp3Meta, getBuffer } = require("./client/");
const { Image } = require("node-webpmux");
const {
    config,
    System,
    isPrivate,
    webpToPng,
    toAudio,
    webp2mp4
} = require("../lib/");
const stickerPackNameParts = config.STICKER_PACKNAME.split(";");

System({
    pattern: "sticker",
    fromMe: isPrivate,
    type: "converter",
    desc: "Converts Photo or video to sticker",
}, async (message, match) => {
   if (!(message.image || message.video || message.reply_message.video || message.reply_message.image)) return await message.reply("_Reply to photo or video_"); 
   let media = (message.video || message.image)? message.msg : message.quoted? message.reply_message.msg : null;  
   let buff = await message.downloadMediaMessage(media);
   return await message.send(buff, { packname: stickerPackNameParts[0], author: stickerPackNameParts[1] }, "sticker");
});

System({
    pattern: "exif",
    fromMe: isPrivate,
    desc: "get exif data",
    type: "converter",
}, async (message, match) => {
    if (!message.reply_message || !message.reply_message.sticker) return await message.reply("_Reply to sticker_");
    const img = new Image();
    await img.load(await message.reply_message.download());
    if (!img.exif) return await message.reply("_No sticker pack info found_");
    const str = img.exif.toString("utf8");
    const json = str.slice(str.indexOf("{"), str.lastIndexOf("}") + 1);
    let exif; try { exif = JSON.parse(json); } catch { return await message.reply("_Can't read this sticker's pack info_"); };
    return await message.reply(`*Sticker Pack ID -->* ${exif["sticker-pack-id"] || "N/A"}\n\n*Pack name -->* ${exif["sticker-pack-name"] || "N/A"}\n\n*Publisher Name -->* ${exif["sticker-pack-publisher"] || "N/A"}`);
});

System({
    pattern: "take",
    fromMe: isPrivate,
    desc: "Changes Exif data of stickers",
    type: "converter",
}, async (message, match) => {
   let data;
   if (!message.quoted || (!message.reply_message.sticker && !message.reply_message.audio)) return await message.reply("_Reply to a sticker or audio_");
   if (message.reply_message.sticker) {
    const stickerPackName = (match || config.STICKER_PACKNAME).split(";");
    return await message.send(await message.reply_message.download(), { packname: stickerPackName[0], author: stickerPackName[1] }, "sticker");
   } else if (message.reply_message.audio) {
    const buff = await message.reply_message.download();
    const audioBuffer = Buffer.from(buff);
    const audioResult = await toAudio(audioBuffer, 'mp4');
    data = match ? match.split(";") : config.AUDIO_DATA.split(";");
    return await message.reply(await AddMp3Meta(audioResult, await getBuffer(data[2]), { title: data[0], body: data[1] }), { mimetype: "audio/mp4" }, "audio");
   };
   return message;
});

System({
    pattern: "photo",
    fromMe: isPrivate,
    desc: "Sticker to Image",
    type: "converter",
}, async (message) => {
   if (!message.reply_message?.sticker) return await message.reply("_Reply to a sticker_");
   if (message.reply_message.isAnimatedSticker) return await message.reply("_Reply to a non-animated sticker message_");
   let buffer = await webpToPng(await message.reply_message.downloadAndSave());
   return await message.send(buffer, {}, "image");
});

System({
    pattern: "gif",
    fromMe: isPrivate,
    desc: "Changes sticker to Gif",
    type: "converter",
}, async (message) => {
   if (!message.reply_message?.sticker) return await message.reply("_Reply to a sticker_");
   if (!message.reply_message.isAnimatedSticker) return await message.reply("_Reply to an animated sticker message_");
   const buffer = await webp2mp4(await message.reply_message.download());
   return await message.send(buffer, { gifPlayback: true }, "video");
});

System({
    pattern: "circle",
    fromMe: isPrivate,
    desc: "Make circle photo or sticker",
    type: "converter",
}, async (message) => {
   if (!(message.image || message.reply_message.sticker || message.reply_message.image)) return await message.reply("_*Reply to photo or sticker*_");
   if (message.reply_message.isAnimatedSticker) return await message.reply("_Reply to a non-animated sticker message_");
   let media = await message.downloadMediaMessage(message.image ? message : message.quoted ? message.reply_message : null);
   if(message.image || message.reply_message.image) {
    return await message.send(await cropToCircle(media), {}, 'image');
   };
   return await message.send(await createRoundSticker(media), { packname: stickerPackNameParts[0], author: stickerPackNameParts[1] }, "sticker");
});

System({
    pattern: "crop",
    fromMe: isPrivate,
    desc: "crop image or sticker",
    type: "converter",
}, async (message) => {
   if (!(message.image || message.reply_message.sticker || message.reply_message.image)) return await message.reply("_*Reply to photo or sticker*_");
   if (message.reply_message.isAnimatedSticker) return await message.reply("_Reply to a non-animated sticker message_");
   if(message.image || message.reply_message.image) {
    let media = await message.downloadMediaMessage(message.image ? message : message.quoted ? message.reply_message : null);
    return await message.send(await cropImage(media), {}, 'image');
   };
   return await message.send(await cropImage(await webpToPng(await message.reply_message.downloadAndSave())), { packname: stickerPackNameParts[0], author: stickerPackNameParts[1] }, "sticker");
});
