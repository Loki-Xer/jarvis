/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, isPrivate, config, toAudio, instaDL, apkDl, pinDl, spotifyMetaData, getPlaylistData } = require("../lib/");
const { extractUrlsFromText, sleep, getJson, isUrl, IronMan, getBuffer } = require('./client/');


System({
  pattern: 'spotify',
  fromMe: isPrivate,
  type: 'download',
  desc: 'Downloads song from Spotify'
}, async (message, match, m) => {
  const link = (await extractUrlsFromText(match || message.reply_message?.text || ''))[0];
  if (!link || !link.includes('spotify.com/')) return await message.reply("_Give a valid Spotify *Url*_");
  if (link.includes('/playlist/')) {
    const data = await getPlaylistData(link);
    if (!data || !data.tracks?.length) return await message.reply("*No tracks found in this Spotify playlist.*");
    const formatTime = (ms) => {
      if (!ms) return "0:00";
      const totalSec = Math.floor(ms / 1000);
      const mins = Math.floor(totalSec / 60);
      const secs = String(totalSec % 60).padStart(2, "0");
      return `${mins}:${secs}`;
    };
    const totalDurationMs = data.tracks.reduce((acc, t) => acc + (t.durationMs || 0), 0);
    const options = data.tracks.slice(0, 12).map((u) => {
      const duration = u.durationFormatted || formatTime(u.durationMs);
      const rawLabel = `*# Title :* ${u.title}\n*Author :* ${u.artist}\n*Duration :* ${duration}`;
      return {
        displayText: rawLabel.length > 98 ? `${rawLabel.slice(0, 94)}...` : rawLabel,
        id: `spotify ${u.spotifyUrl}`
      };
    });
    const pollHeader = [
      `*𝘚𝘱𝘰𝘵𝘪𝘧𝘺 𝘗𝘭𝘢𝘺𝘭𝘪𝘴𝘵*`,
      ``,
      `*▢ Title :* ${data.name}`,
      `*▢ Author :* ${data.owner}`,
      `*▢ Tracks :* ${data.totalTracksReturned}${data.totalTracksReturned > 12 ? " (Showing top 12)" : ""}`,
      `*▢ Duration :* ${data.totalDurationFormatted || formatTime(totalDurationMs)}`,
      data.description ? `*▢ Bio :* ${data.description}` : null,
      ``,
      `_Select a track below to download:_`
    ].filter(line => line !== null).join("\n");
    return await message.send(
      pollHeader, {
        values: options,
        withPrefix: true,
        participates: [message.sender]
      }, "poll");
  }

  const meta = await spotifyMetaData(link);
  let txt = `*_${meta.title}_*\n*_${meta.description}_*\n\n\n\`\`\`1.⬢\`\`\` *audio*\n\`\`\`2.⬢\`\`\` *video*\n\n_*Send a number as a reply to download*_`;
  return await message.reply({ url: meta.thumbnail }, 'image', { caption: txt });
});

System({
    pattern: "(ts|tg)",
    fromMe: isPrivate,
    type: "download",
    desc: "Download Sticker From Telegram"
}, async (message, match, client) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply("_Enter a tg sticker url_\nEg: https://t.me/addstickers/Vc_me_dance_pack_by_fStikBot\nKeep in mind that there is a chance of ban if used frequently");
    let packid = match.split("/addstickers/")[1];
    let { result } = await getJson(`https://api.telegram.org/${config.TGTOKEN}/getStickerSet?name=${encodeURIComponent(packid)}`);
    if (result.is_animated) return message.reply("_Animated stickers are not supported_");
    message.reply(`*Total stickers :* ${result.stickers.length}\n*Estimated complete in:* ${result.stickers.length * 1.5} seconds\nKeep in mind that there is a chance of ban if used frequently`.trim());
    for (let sticker of result.stickers) {
        let file_path = await getJson(`https://api.telegram.org/${config.TGTOKEN}/getFile?file_id=${sticker.file_id}`);
        const buff = `https://api.telegram.org/file/${config.TGTOKEN}/${file_path.result.file_path}`;
        const stickerPackNameParts = config.STICKER_PACKNAME.split(";");
        const packname = stickerPackNameParts[0];
        const author = stickerPackNameParts[1];
        await message.send(buff, { packname, author, webp: true }, "sticker");
        await sleep(5500);
    }
    return await message.reply('Done');
});

System({
  pattern: '(apk|app)',
  fromMe: isPrivate,
  type: 'download',
  desc: 'Downloads and sends an app '
}, async (message, match, m) => {
  let appId = match || m.reply_message.text;
  if (!appId) return await message.reply('*Nᴇᴇᴅ ᴀɴ ᴀᴘᴘ ɴᴀᴍᴇ*\n*Exᴀᴍᴘʟᴇ: ꜰʀᴇᴇ ꜰɪʀᴇ*');
  const result= await apkDl(appId);
  await message.reply({ url: result.link }, { mimetype: 'application/vnd.android.package-archive', fileName: result.appname, caption: `*App Name:* ${result.appname}\n*Developer:* ${result.developer}`, quoted: message.data }, "document");
});

System({
    pattern: '(fb|facebook)',
    fromMe: isPrivate,
    type: 'download',
    desc: 'Download Facebook video'
}, async (message, text) => {
    var match = (await extractUrlsFromText(text || message.reply_message?.text))[0];
    if (!match) return await message.reply("*Need a Facebook public media link*\n_Example: .fb_\n*NOTE: ONLY VIDEO LINK*");
    const { result } = await getJson(api + "download/facebook?url=" + match);
    if (!result || (!result.hd && !result.sd)) return await message.reply("Could not fetch video. Please check the link.");
    if (!message.isGroup) return await message.sendFromUrl(result.sd, { quoted: message.data });
    await message.send("Choose Quality", { values: [{ displayText: "HD", id: `sendurl ${result.hd}` }, { displayText: "SD", id: `sendurl ${result.sd}` }], onlyOnce: true, withPrefix: true, participates: [message.sender] }, "poll");
});



System({
    pattern: 'pinterest',
    fromMe: isPrivate,
    type: "download",
    desc: "pinterest downloader"
}, async (message, text, m) => {
    let match = (await extractUrlsFromText(text || message.reply_message.text))[0];
    if (!match) return await message.reply('_Please provide a pinterest *url*_');
    if (!isUrl(match)) return await message.reply("_Please provide a valid pinterest *url*");
    if (!match.includes("pin.it")) return await message.reply("_Please provide a valid pinterest *url*");
    const result = await pinDl(match);
    await message.sendFromUrl(result.url, { caption: "_*downloaded 🤍*_" });
});

System({
    pattern: 'insta',
    fromMe: isPrivate,
    type: 'download',
    desc: 'instagram downloader',
}, async (message, match) => {
    const url = (await extractUrlsFromText(match || message.reply_message.text))[0];
    if (!url) return await message.reply('Please provide an Instagram *url*'); 
    if (!isUrl(url)) return await message.reply("Please provide a valid Instagram *url*");
    if (!url.includes("instagram.com")) return await message.reply("*Please provide a valid Instagram url*");
    const data = await instaDL(url);
    if (!data || data.length === 0) return await message.reply("*No content found at the provided URL*");
    for (const imageUrl of data) {
        if (imageUrl) await message.sendFromUrl(imageUrl.url, { quoted: message.data });
    }
});

System({
  pattern: "story",
  fromMe: isPrivate,
  type: "download",
  desc: "To download insta story",
}, async (message, match) => {
  match = match || message.reply_message.text;
  if (!isUrl(match)) {
    const { media: result } = await getJson(IronMan("ironman/ig/story?user=" + match));
    if (!result) return await message.reply("*Exᴀᴍᴘʟᴇ: .story username/link*");
    if(result.length === 1) return await message.sendFromUrl(result[0], { caption: "*done ♥️*", quoted: message });
    const options = result.map((u, index) => ({ displayText:`${index + 1}/${result.length}`, id: `sendurl ${u}` }));
    if(message.isGroup) return await message.send("\n*Story downloader*\n", { values: options, withPrefix: true, participates: [message.sender] }, "poll");
    for (const media of result) {
      await message.sendFromUrl(media, { quoted: message.data });
    }
    return;
  }
  const url = (await extractUrlsFromText(match))[0];
  if (!url.includes("instagram.com")) return message.reply("_*Provide a valid Instagram story URL*_");
  const result = await instaDL(url);
  if (!result || result.length === 0) return await message.reply("*Exᴀᴍᴘʟᴇ: .story username/link*");
  if(result.length === 1) return await message.sendFromUrl(result[0].url, { caption: "*done ♥️*", quoted: message });
  const options = result.map((u, index) => ({ displayText:`${index + 1}/${result.length}`, id: `sendurl ${u.url}` }));
  if(message.isGroup) return await message.send("\n*Story downloader*\n", { values: options, withPrefix: true, participates: [message.sender] }, "poll");
  for (const media of result) {
    await message.sendFromUrl(media.url, { quoted: message.data });
  }
});

System ({
    pattern: 'gitdl',
    fromMe: isPrivate,
    desc: 'Repository Downloader',
    type: 'download',
}, async (message, match) => {
   match = match || message.reply_message.text;
   if (!isUrl(match)) return await message.reply("*_Need A GitHub Repository Url_*")
   let user = match.split("/")[3];
   let repo = match.split("/")[4];
   const msg = await message.send("_*Downloading 🪲*_", { quoted: message.data });
   await message.reply({ url: `https://api.github.com/repos/${user}/${repo}/zipball` }, { fileName: repo , mimetype: "application/zip" }, "document");
   await msg.edit("_*downloaded 🍓*_");
});

System({
    pattern: '(twitter|twdl)',
    fromMe: isPrivate,
    type: 'download',
    desc: 'Download Twitter video'
}, async (message, match, m) => {
    match = message.quoted && message.reply_message.text ? message.reply_message.text : match;
    if (!match || !match.includes('x.com')) return await message.send("_Need a x(twitter) media url_");
    const url = (await extractUrlsFromText(match))[0];
    const fek = await getJson(IronMan(`ironman/dl/x?url=${encodeURIComponent(url)}`));
    await message.sendFromUrl(fek.download);
});

System({
    pattern: 'thread',
    fromMe: isPrivate,
    type: 'download',
    desc: 'Download threads media',
}, async (message, match) => {
    match = message.quoted && message.reply_message.text ? message.reply_message.text : match;
    if (!match || !match.includes('threads')) return await message.send("_Need a threads media url_");
    const encodedUrl = encodeURIComponent((await extractUrlsFromText(match.trim()))[0]);
    const media = await getJson(IronMan(`ironman/dl/threads?url=${encodedUrl}`));
    if (media.video) {
        for (const videoUrl of media.video) {
            await message.reply({ url: videoUrl }, { caption: "*Download🤍*" }, "video");
        }
    }
    if (media.image) {
        for (const imageUrl of media.image) {
            await message.reply({ url: imageUrl }, { caption: "*Download🤍*" }, "image");
        }
    }
});

System({
        pattern: "(tbox|terabox)", 
        fromMe: isPrivate, 
        type: "download",
	desc: "download terabox file"
  }, async (msg, match) => {
       match = (await extractUrlsFromText(match || msg.reply_message.text))[0];
       if (!isUrl(match)) return msg.reply("*Reply to Terabox url or provide a Terabox url*");
       if (!match || !match.includes("tera")) return msg.reply("*Reply to Terabox url or provide a Terabox url*");
       const { result } = await getJson(api + "download/terabox?url=" + match);
       for (const { filename, downloadUrl } of result) {
	       await msg.send(downloadUrl, 'document', {
		       fileName: filename,
		       mimetype: require('mime-types').lookup(filename) || 'application/octet-stream',
		       caption: '*Enjoy brother 🤍*'
		});
       };
});

System({
	pattern: 'tiktok',
	fromMe: isPrivate,
	type: 'download',
	desc: 'Download TikTok video or image'
}, async (message, match, msg) => {
  match = (await extractUrlsFromText(match || message.reply_message.text))[0];
  if (!isUrl(match)) return message.reply("*Reply to TikTok URL or provide a TikTok URL*");
  if (!match || !match.includes("tiktok")) return message.reply("*Reply to TikTok URL or provide a TikTok URL*");
  const { result: data } = await getJson(api + "download/tiktok?url=" + match);
  var vidd = data.data.find(item => item.type === 'nowatermark_hd');
  var ved = data.data.find(item => item.type === 'nowatermark');
  var pic = data.data.filter(item => item.type === 'photo');
  if (vidd || ved) {
    if (!message.isGroup) {
      if (vidd) {
        await message.reply({ url: vidd.url }, { caption: "*_Downloaded_*", quoted: message.data }, "video");
      } else {
        return message.reply("*Video not available*");
      }
    } else {
      await message.send("Choose quality", { values: [{ displayText: "HD", id: `sendurl ${vidd?.url}` }, { displayText: "SD", id: `sendurl ${ved?.url}` }].filter(Boolean), onlyOnce: 1, withPrefix: true, participates: [message.sender] }, "poll");
    }
  } else if (pic.length > 0) {
    for (var photo of pic) {
      await message.reply({ url: photo.url }, { caption: "*_Downloaded!_*", quoted: message.data }, "image");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } else {
    return message.reply("*Couldn't find media*");
  }
});

System({
    pattern: 'sendurl',
    fromMe: isPrivate,
    type: 'download',
    desc: 'Download url'
}, async (message, text) => {
    let match = await extractUrlsFromText(text);
    if (!match) return await message.reply("*need a url*");
    let data = { key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast", id: message.client.generateMessageId() }, message: { extendedTextMessage: { "text": "\n*Made With Love 🤍*" }}};
    for (const imageUrl of match) {
        if (imageUrl) await message.sendFromUrl(imageUrl, { caption: "*Done ✨*", quoted: data });
    }
});

System({
    pattern: 'snap',
    fromMe: isPrivate,
    type: 'download',
    desc: 'snap downloader'
}, async (message, match) => {
    const url = (await extractUrlsFromText(match || message.reply_message.text))[0];
    if (!url) return await message.reply('Please provide an SnapChat *url*'); 
    if (!isUrl(url)) return await message.reply("Please provide a valid SnapChat *url*");
    if (!url.includes("snapchat.com")) return await message.reply("*Please provide a valid snapchat url*");
    const { result: data } = await getJson(api + "download/snapchat?url=" + url);
    if (!data || data.length === 0) return await message.reply("*No content found at the provided URL*");
    for (const imageUrl of data) {
        if (imageUrl) await message.sendFromUrl(imageUrl.url, { quoted: message.data });
    }
});

System({
	pattern: '(xnxx|xvd)',
	fromMe: isPrivate,
    nsfw: true,
	type: "download",
        desc: "xnxx downloader",
}, async (message, match) => {
    match = match || message.reply_message.text;
    if(!match) return await message.reply("_*need a query*_");
    if(isUrl(match)) {
        let url = (await extractUrlsFromText(match))[0];
        const { result } = await getJson(api + `download/xnxx?url=${url}`);
        await message.sendFromUrl(result.files.high, { caption: "👅💦" });
    } else {
        let url = await getJson(api + `search/xnxx?q=${match}`); 
        const { result } = await getJson(api + `download/xnxx?url=${url.result[0].link}`);
        await message.sendFromUrl(result.files.high, { caption: "👅💦" });
    }
});
