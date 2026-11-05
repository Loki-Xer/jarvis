/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const { System, isPrivate, bing, duckGo } = require("../lib/");
const { IronMan, getJson, isUrl } = require('./client/');


System({
  pattern: 'img',
  fromMe: isPrivate,
  desc: 'Search google images',
  type: 'search',
}, async (message, match) => {
  let [query, count] = match.split(',').map(item => item.trim());
  let imageCount = count ? parseInt(count) : 5;
  if (!query) return await message.reply("*Need a Query*\n_Example: .img ironman, 5_");
  let msg = await message.send(`Downloading ${imageCount} images of *${query}*`);
  let urls = await bing(query, { limit: imageCount });
  if (!urls.length) return await message.send("*No images found*");
  for (let url of urls) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
          await message.sendFromUrl(url.image, {
              caption: url.title
          });
      } catch (e) {
          if (!url.thumbnail) continue;
          try {
              await message.sendFromUrl(url.thumbnail, { 
                caption: url.title 
              });
          } catch {}
      }
  };
  await msg.edit("*Downloaded*");
});

System({
    pattern: 'xsearch',
    fromMe: isPrivate,
    nsfw: true,
    type: "search",
    desc: "Xnxx searcher"
}, async (message, match) => {
    if (!match || isUrl(match)) return await message.reply('_Please provide a valid query_');
    const data = await getJson(api + `search/xnxx?q=${encodeURIComponent(match)}`);
    await message.send(data.result.map(item => `*💎 Title:* ${item.title}\n*🔗 Link:* ${item.link}\n\n`).join(""));
});

System({
    pattern: '(duckgo|dg)',
    fromMe: isPrivate,
    type: "search",
    desc: "goduck searcher"
}, async (message, match) => {
  if (!match) return await message.reply("*Need a query to search*\n_Example: who is iron man_");
  let result = await duckGo(match);
  if (!result.length) return await message.reply("*Can't find, try again with more info*");
  await message.reply(`*⬢ Title :* ${result[0].title}\n\n*⬢ Description :* ${result[0].description}\n\n*⬢ Link :* ${result[0].link}`);    
});
