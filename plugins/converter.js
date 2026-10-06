/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const fs = require('fs');
const ff = require('fluent-ffmpeg');
const { fromBuffer } = require('file-type');
const {
    config,
    System,
    isPrivate,
    toAudio,
    toVideo,
    sendUrl,
    webp2mp4,
    setData,
    getData,
    translate,
    makeUrl
} = require("../lib/");
const { 
    trim,
    getJson,
    IronMan,
    postJson,
    removeBg,
    getBuffer,
    AddMp3Meta,
    extractUrlsFromText
} = require("./client/"); 
const fancy = require('./client/fancy');


System({
    pattern: "mp3",
    fromMe: isPrivate,
    desc: "mp3 converter",
    type: "converter",
}, async (message, match) => {
   if (!(message.reply_message.video || message.reply_message.audio))
   return await message.reply("_Reply to audio or video_");	
   var audioResult = await toAudio(await message.reply_message.download());
   const [firstName, author, image] = config.AUDIO_DATA.split(";");
   const aud = await AddMp3Meta(audioResult, await getBuffer(image), { title: firstName, body: author });
   await message.reply(aud, { mimetype: "audio/mp4" }, "audio");
});

System({
    pattern: "ptv",
    fromMe: isPrivate,
    desc: "video into pvt converter",
    type: "converter",
}, async (message) => {
   if (!message.video && !message.reply_message.video) return message.reply("_*Reply to a video*_");
   const buff = await message.downloadMediaMessage(message.video ? message.msg : message.quoted ? message.reply_message.msg : null);
   await message.reply(buff, { ptv: true }, "video");
});

System({
    pattern: "wawe",
    fromMe: isPrivate,
    desc: "audio into wave",
    type: "converter",
}, async (message) => {
   if (!message.quoted || !message.reply_message?.audio && !message.reply_message?.video) return await message.reply("_Reply to an audio/video_");
   let media = await toAudio(await message.reply_message.download(), "opus");
   return await message.send(media, { mimetype: 'audio/mpeg', ptt: true, quoted: message.data }, "audio");
});

System({
    pattern: "mp4",
    fromMe: isPrivate,
    desc: "Changes sticker to Video",
    type: "converter",
}, async (message) => {
   if (!message.reply_message?.sticker) return await message.reply("_Reply to a sticker_");
   if (!message.reply_message.isAnimatedSticker) return await message.reply("_Reply to an animated sticker message_");
   let buffer = await webp2mp4(await message.reply_message.download());
   return await message.send(buffer, {}, "video");
});

System({
    pattern: 'black',
    fromMe: isPrivate,
    desc: 'make audio into black video',
    type: "converter"
}, async (message) => {
        const ffmpeg = ff();
        if (!message.reply_message?.audio) return await message.send("_Reply to an audio message_");
        const file = './plugins/client/black.jpg';
        const audioFile = './lib/temp/audio.mp3';
        fs.writeFileSync(audioFile, await message.reply_message.download());
        ffmpeg.input(file);
        ffmpeg.input(audioFile);
        ffmpeg.output('./lib/temp/videoMixed.mp4');
        ffmpeg.on('end', async () => {
            await message.send(fs.readFileSync('./lib/temp/videoMixed.mp4'), {}, 'video');
        });
        ffmpeg.on('error', async (err) => {
            console.error('FFmpeg error:', err);
            await message.reply("An error occurred during video conversion.");
        });
        ffmpeg.run();
});

System({
    pattern: "fancy",
    fromMe: isPrivate,
    desc: "converts text to fancy text",
    type: "converter",
 }, (async (message, match) => {    
    if (!match && !message.reply_message.message) return await message.reply('\n*Fancy text*\n\n*Example:*\n*reply to a text and : fancy 7*\n*or*\n*use : fancy hy 5*\n\n'+String.fromCharCode(8206).repeat(4001)+fancy.list('Text here',fancy));
    const id = match.match(/\d/g)?.join('')
     try {
        if (id === undefined && !message.quoted){
            return await message.reply(fancy.list(match, fancy));
        }
        return await message.reply(fancy.apply(fancy[parseInt(id)-1], message.reply_message.text || match.replace(id,'')))    
    } catch {
        return await message.reply('_*No such style :(*_')
     }
 }));

System({
    pattern: 'doc',
    desc: "convert media to document",
    type: 'converter',
    fromMe: isPrivate
}, async (message, match) => {
    match = (match || "converted media").replace(/[^A-Za-z0-9]/g,'-');
    if (!(message.image || message.video || (message.quoted && (message.reply_message.image || message.reply_message.audio || message.reply_message.video)))) return message.send("_*Reply to a video/audio/image message!*_");
    let msg = (message.video || message.image)? message.msg : message.quoted? message.reply_message.msg : null;  
    let media = await message.downloadMediaMessage(msg);
    const { ext, mime } = await fromBuffer(media);
    return await message.reply(media, { mimetype: mime, fileName: match + "." + ext }, "document");
});

System({
    pattern: "url",
    fromMe: isPrivate,
    desc: "make media into url",
    type: "converter",
}, async (message, match) => {
    if (!message.quoted || (!message.reply_message.image && !message.reply_message.video && !message.reply_message.audio && !message.reply_message.sticker)) return await message.reply('*Reply to image,video,audio,sticker*');
    return await sendUrl(message);
});

System({
    pattern: "rbg", 
    fromMe: isPrivate,
    desc: "To remove bg", 
    type: "converter",
}, async (m, match) => {
    if (match && match.includes("key")) {
      await setData(m.user.id, match.split(":")[1].trim(), "true", "removeBg");
      return m.reply("*Key added successfully. Now you can use rbg.*");
    }
    if (!m.image && !m.reply_message.image) return m.reply("*Reply to an image*");
    const db = await getData(m.user.id);
    if (!db.removeBg) return m.reply(`*Dear user, get an API key to use this command. Sign in to remove.bg and get an API key. After that, use* \n\n *${m.prefix} rbg key: _your API key_* \n\n Sign in here: https://www.remove.bg/dashboard#api-key`);
    let buff = await removeBg(await m.downloadAndSaveMediaMessage(m.image ? m.msg : m.quoted ? m.reply_message.msg : null), db.removeBg.message);
    if(!buff) return m.reply("*Error in api key or can't upload to remove.bg*");
    await m.reply(buff, {}, "image");
});

System({
    pattern: "trim",
    fromMe: isPrivate,
    desc: "to trim audio/video",
    type: "converter",
}, async (m, text) => {
    if (!(m.video || (m.quoted && (m.reply_message.audio || m.reply_message.video)))) return m.reply("*Reply to a video/audio e.g. _.trim 1.0,3.0*");
    if (!text) return m.reply("*Need query to trim e.g.: _.trim 1.0,3.0*");
    const parts = text.split(',');
    const numberRegex = /^-?\d+(\.\d+)?$/;
    const areValidNumbers = parts.every(part => numberRegex.test(part));
    if (!areValidNumbers) return m.reply("*Please check your format. The correct format is .trim 1.0,3.0*");
    if (m.video && m.reply_message.video) {
        const file = await m.downloadMediaMessage(m.video ? m.msg : m.quoted ? m.reply_message.msg : null);
        const output = await trim(file, parts[0], parts[1]);
        if (!output) return m.reply("*Please check your format. The correct format is .trim 1.0,3.0*"); 
        await m.reply(output, {}, "video");
    } else if (m.reply_message.audio) {
        const file = await toVideo(await m.reply_message.downloadAndSave());
        const output = await trim(file, parts[0], parts[1]);
        if (!output) return m.reply("*Please check your format. The correct format is .trim 1.0,3.0*");
        await m.reply(output, { mimetype: "audio/mp4" }, "audio");
    }
});

System({
  pattern: "trt",
  fromMe: isPrivate,
  desc: "change language",
  type: "converter",
}, async (message, match) => {
  if(message.quoted && message.reply_message.text && match) match = message.reply_message.text + ";" + match;
  if(message.quoted && message.reply_message.text && !match) match = message.reply_message.text;
  if (!match) return await message.reply("_provide text to translate *eg: i am fine;ml*_");
  const idx = match.lastIndexOf(";");
  const text = idx == -1 ? [match] : [match.slice(0, idx), match.slice(idx + 1)];
  const language = (text[1] || config.LANGUAGE).trim();
  if (language.toLowerCase().includes("manglish")) {
      if(isManglish(text[0])) {
          return await message.reply("_Can't convert, it's already manglish_");
      } else if (isMalayalam(text[0])) {
          return await message.reply(malayalamToManglish(text[0]));
      } else {
          const result = await translate(text[0], "ml");
          return await message.reply(malayalamToManglish(result) || "_failed to convert_");
      };
  };
  const result = await translate(text[0], language);
  return await message.reply(result || "_failed to translate_");
});
