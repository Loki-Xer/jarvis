const { System, isPrivate, spotifyMetaData, YtInfo, instaDL, config, pinDl } = require("../lib/");
const { extractUrlsFromText, getJson, IronMan, platforms } = require("./client/");

System({
  on: "text",
  fromMe: isPrivate,
  dontAddCommandList: true,
}, async (message, match) => {
  if (!config.AUTO_DL) return;
  if (message.isBot || !match) return;
  try {
    const matches = (host, domain) => host === domain || host.endsWith("." + domain);
    const url = (await extractUrlsFromText(match))?.[0];
    if (!url) return;
    const host = new URL(url).hostname.toLowerCase();
    const platform = platforms.find(p =>
      p.domains.some(d => matches(host, d)) || (p.regex && p.regex.test(host))
    );
    if (!platform) return;
    if (platform.name === "Facebook") {
      const { result } = await getJson(api + "download/facebook?url=" + url);
      if (!result || (!result.hd && !result.sd)) return false;
      return await message.sendFromUrl(result.hd || result.sd, { quoted: message.data });
    } else if (platform.name === "Spotify") {
      if (url.includes("/playlist/")) return;
      const meta = await spotifyMetaData(url);
      const txt = `*_${meta.title}_*\n*_${meta.description}_*\n\n\n\`\`\`1.⬢\`\`\` *audio*\n\`\`\`2.⬢\`\`\` *video*\n\n_*Send a number as a reply to download*_`;
      return await message.reply({ url: meta.thumbnail }, "image", { caption: txt });
    } else if (platform.name === "YouTube") {
      const yt = await YtInfo(url);
      const txt = `*_${yt.title}_*\n\n\n\`\`\`1.⬢\`\`\` *audio*\n\`\`\`2.⬢\`\`\` *video*\n\n_*Send a number as a reply to download*_`;
      return await message.reply({ url: yt.thumbnail }, { caption: txt }, "image");
    } else if (platform.name === "GitHub") {
      const [, , , user, rawRepo] = url.split("?")[0].split("#")[0].split("/");
      if (!user || !rawRepo) return;
      const repo = rawRepo.replace(/\.git$/, "");
      return await message.reply({ url: `https://api.github.com/repos/${user}/${repo}/zipball` }, { fileName: repo, mimetype: "application/zip" }, "document");
    } else if (platform.name === "Instagram") {
      const data = await instaDL(url);
      if (!data || data.length === 0) return false;
      for (const item of data) {
        if (item) await message.sendFromUrl(item.url, { quoted: message.data });
      };
    } else if (platform.name === "Twitter") {
      const data = await getJson(IronMan(`ironman/dl/x?url=${encodeURIComponent(url)}`));
      await message.sendFromUrl(data.download);
    } else if (platform.name === "Pinterest") {
      if (url.includes("pin.it")) {
        const result = await pinDl(url);
        await message.sendFromUrl(result.url, { caption: "_*downloaded 🤍*_" });
      }
    };
  } catch (error) {
    console.log(error);
  };
});
