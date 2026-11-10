/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const { System, isPrivate, spotifyMetaData, YtInfo, instaDL, config, pinDl, tiktokDl } = require("../lib/");
const { extractUrlsFromText, getJson, IronMan, platforms } = require("./client/");

System({
  on: "text",
  fromMe: isPrivate,
  dontAddCommandList: true,
}, async (message, match) => {
  if (!config.AUTO_DL) return false;
  if (message.isBot || !match) return false;
  try {
    const matches = (host, domain) => host === domain || host.endsWith("." + domain);
    const url = (await extractUrlsFromText(match))?.[0];
    if (!url) return false;
    const host = new URL(url).hostname.toLowerCase();
    const platform = platforms.find(p =>
      p.domains.some(d => matches(host, d)) || (p.regex && p.regex.test(host))
    );
    if (!platform) return false;
    if (platform.name === "Facebook") {
      const { result } = await getJson(api + "download/facebook?url=" + url);
      if (!result || (!result.hd && !result.sd)) return false;
      return await message.sendFromUrl(result.hd || result.sd, { quoted: message.data });
    } else if (platform.name === "Spotify") {
      if (url.includes("/playlist/") || url.includes('/album/')) return false;
      const meta = await spotifyMetaData(url);
      const txt = `*_${meta.title}_*\n*_${meta.description}_*\n\n\n\`\`\`1.⬢\`\`\` *audio*\n\`\`\`2.⬢\`\`\` *video*\n\n_*Send a number as a reply to download*_`;
      return await message.reply({ url: meta.thumbnail }, "image", { caption: txt });
    } else if (platform.name === "YouTube") {
      const yt = await YtInfo(url);
      const txt = `*_${yt.title}_*\n\n\n\`\`\`1.⬢\`\`\` *audio*\n\`\`\`2.⬢\`\`\` *video*\n\n_*Send a number as a reply to download*_`;
      return await message.reply({ url: yt.thumbnail }, { caption: txt }, "image");
    } else if (platform.name === "GitHub") {
      const [, , , user, rawRepo] = url.split("?")[0].split("#")[0].split("/");
      if (!user || !rawRepo) return false;
      const repo = rawRepo.replace(/\.git$/, "");
      return await message.reply({ url: `https://api.github.com/repos/${user}/${repo}/zipball` }, { fileName: repo, mimetype: "application/zip" }, "document");
    } else if (platform.name === "Instagram") {
      const data = await instaDL(url);
      if (!data || data.length === 0) return false;
      for (const item of data) {
        if (item) await message.sendFromUrl(item.url, { quoted: message.data });
      };
      return true;
    } else if (platform.name === "Twitter") {
      const data = await getJson(IronMan(`ironman/dl/x?url=${encodeURIComponent(url)}`));
      return await message.sendFromUrl(data.download);
    } else if (platform.name === "Pinterest") {
      if (url.includes("pin.it")) {
        const result = await pinDl(url);
        return await message.sendFromUrl(result.url, { caption: "_*downloaded 🤍*_" });
      }
    } else if (platform.name === "TikTok") {
      const data = await tiktokDl(url);
      var vidd = data.data.find(item => item.type === 'nowatermark_hd');
      var ved = data.data.find(item => item.type === 'nowatermark');
      var pic = data.data.filter(item => item.type === 'photo');
      if (vidd || ved) {
        if (!message.isGroup) {
          if (vidd) {
            return await message.reply({ url: vidd.url }, { caption: "*_Downloaded_*", quoted: message.data }, "video");
          } else {
            return message.reply("*Video not available*");
          }
        } else {
          return await message.send("Choose quality", { values: [{ displayText: "HD", id: `sendurl ${vidd?.url}` }, { displayText: "SD", id: `sendurl ${ved?.url}` }].filter(Boolean), onlyOnce: 1, withPrefix: true, participates: [message.sender] }, "poll");
        }
      } else if (pic.length > 0) {
        for (var photo of pic) {
          return await message.reply({ url: photo.url }, { caption: "*_Downloaded!_*", quoted: message.data }, "image");
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        return message;
      }
    }
  } catch (error) {
    console.log(error);
  };
});