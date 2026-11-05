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
   await message.send(buff, { packname: stickerPackNameParts[0], author: stickerPackNameParts[1] }, "sticker");
});

System({
    pattern: "exif",
    fromMe: isPrivate,
    desc: "get exif data",
    type: "converter",
}, async (message, match) => {
   if (!message.reply_message || !message.reply_message.sticker) return await message.reply("_Reply to sticker_");
   let img = new Image();
   await img.load(await message.reply_message.download());
   const exif = JSON.parse(img.exif.slice(22).toString());
   const stickerPackId = exif['sticker-pack-id'];
   const stickerPackName = exif['sticker-pack-name'];
   const stickerPackPublisher = exif['sticker-pack-publisher'];
   const cap = (`*Sticker Pack ID -->* ${stickerPackId}\n\n*Pack name -->* ${stickerPackName}\n\n*Publisher Name -->* ${stickerPackPublisher}`)
   await message.reply(cap);
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
    await message.send(await message.reply_message.download(), { packname: stickerPackName[0], author: stickerPackName[1] }, "sticker");
   } else if (message.reply_message.audio) {
    const buff = await message.reply_message.download();
    const audioBuffer = Buffer.from(buff);
    const audioResult = await toAudio(audioBuffer, 'mp4');
    data = match ? match.split(";") : config.AUDIO_DATA.split(";");
    await message.reply(await AddMp3Meta(audioResult, await getBuffer(data[2]), { title: data[0], body: data[1] }), { mimetype: "audio/mp4" }, "audio");
   }
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
   await message.send(await createRoundSticker(media), { packname: stickerPackNameParts[0], author: stickerPackNameParts[1] }, "sticker");
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
   await message.send(await cropImage(await webpToPng(await message.reply_message.downloadAndSave())), { packname: stickerPackNameParts[0], author: stickerPackNameParts[1] }, "sticker");
});