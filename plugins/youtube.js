/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const {
    yts,
    System,
    config,
    YtInfo,
    toAudio,
    youtube,
    isPrivate,
} = require('../lib/');
const { isUrl, getBuffer, AddMp3Meta, extractUrlsFromText, formatDuration, formatViews, cleanTitle } = require('./client/');



System({
      pattern: '(video|ytv)',
      fromMe: isPrivate,
      type: 'download',
      desc: 'YouTube video downloader'
}, async (message, match) => {
      match = match || message.reply_message.text;
      if (!match) return await message.reply('_Give a YouTube video *Url* or *Query*_');
     const matchUrl = (await extractUrlsFromText(match))[0];
     if (isUrl(matchUrl)) {
         const { title, url } = await youtube(matchUrl, "video");
         await message.reply("_*" + "downloading " + title + "*_");
         return await message.send({ url: url }, { caption: '*made with 🤍*', quoted: message.data }, 'video');
      } else {
        const { url } = (await yts(match))[0];
        const data = await youtube(url, "video");
        await message.reply("_*" + "downloading " + data.title + "*_"); 
        return await message.send({ url: data.url }, { caption: '*made with 🤍*', quoted: message.data }, 'video');
      }
});

System({
      pattern: '(yta|song)',
      fromMe: isPrivate,
      type: 'download',
      desc: 'YouTube audio downloader'
}, async (message, match) => {
      match = match || message.reply_message.text;
      if (!match) return await message.reply('_Give a YouTube video *Url* or *Query*_');
      const matchUrl = (await extractUrlsFromText(match))[0];
      if (isUrl(matchUrl)) {
          const { url } = await youtube(matchUrl);
          const { title, author, thumbnail } = await YtInfo(matchUrl);
          await message.reply("_*" + "downloading " + title + "*_");
          const aud = await AddMp3Meta(await toAudio(await getBuffer(url)), await getBuffer(thumbnail), { title: title, body: author });
          return await message.reply(aud, { mimetype: 'audio/mpeg' }, "audio");
      } else {
          const { title, author, thumbnail, url } = (await yts(match))[0];
          await message.reply("_*" + "downloading " + title + "*_");
          const aud = await AddMp3Meta(await toAudio(await getBuffer((await youtube(url)).url)), await getBuffer(thumbnail), { title: title, body: author.name });
          return await message.reply(aud, { mimetype: 'audio/mpeg' }, "audio");
     }
});

System({
    pattern: 'play',
    fromMe: isPrivate,
    desc: 'YouTube video player',
    type: 'download',
}, async (message, match) => {
      if (!match) return await message.reply('_Give a *Query* to play the song or video_');
      if (isUrl(match)) {
          let matchUrl = (await extractUrlsFromText(match))[0];
          const yt = await YtInfo(matchUrl);
          let txt = `*_${yt.title}_*\n\n\n\`\`\`1.⬢\`\`\` *audio*\n\`\`\`2.⬢\`\`\` *video*\n\n_*Send a number as a reply to download*_`;
          return await message.reply({ url : yt.thumbnail }, { caption: txt }, 'image');
      } else {
          const yt = (await yts(match))[0];
          let txt = `*_${yt.title}_*\n\n\n\`\`\`1.⬢\`\`\` *audio*\n\`\`\`2.⬢\`\`\` *video*\n\n_*Send a number as a reply to download*_`;
          return await message.reply({ url : yt.image }, { caption: txt }, 'image');
      }
});
  
  System({
    on: 'text',
    fromMe: isPrivate,
    dontAddCommandList: true,
  }, async (message) => {
    if (message.isBot || !message.quoted) return false;
    if (!message.reply_message.fromMe || !message.reply_message.text) return false;
    if (!message.body.includes('⬢')) return false;
    let match = message.body.replace('⬢', '');
    if (message.body.includes('1')) {
      const ytAudio = (await yts(match))[0];
      const msg = await message.send(`_*Now playing : ${ytAudio.title} 🎶*_`);
      const data = config.AUDIO_DATA.split(';');
      const aud = await AddMp3Meta(await toAudio(await getBuffer((await youtube(ytAudio.url)).url), 'mp3'), await getBuffer(data[2]), { title: data[0], body: data[1], });
      await message.reply(aud, { mimetype: 'audio/mpeg', quoted: msg }, "audio");
    } else if (message.body.includes('2')) {
      const data = (await yts(match))[0];
      const q = await message.send(`_*Now playing : ${data.title} 🎶*_`);
      return await message.send(
        await getBuffer((await youtube(data.url, "video")).url), { caption: `_*${data.title}*_`, quoted: q }, 'video');
    };
  });
  
  System({
       pattern: 'yts',
       fromMe: isPrivate,
       desc: "yt search",
       type: "search",
  }, async (message, match) => {
      if (!match) return await message.reply('_Please provide an *Query or Url*');    
      if (isUrl(match)) {
        let matchUrl = (await extractUrlsFromText(match))[0];
        const yt = await YtInfo(matchUrl);
        return await message.reply({ url: yt.thumbnail }, { caption: `*_${yt.title}_*\n\n\n\`\`\`1.⬢\`\`\` *audio*\n\`\`\`2.⬢\`\`\` *video*\n\n_*Send a number as a reply to download*_` }, 'image');
      } else {
        const result = (await yts(match)).slice(0, 12);
        const options = result.map((u) => ({ displayText: `*${cleanTitle(u.title)}*\n*Author:* ${u.author || "Unknown"}\n*Duration:* ${formatDuration(u.duration)}\n*Views:* ${formatViews(u.views)}\n*Published:* ${u.publishedTime || "Unknown"}`, id: `play ${u.url}`, image: u.image }));
        return await message.send(`*YouTube Search*\n\n*Query:* ${match}`, { values: options, withPrefix: true, participates: [message.sender] }, "poll");
      }
  });