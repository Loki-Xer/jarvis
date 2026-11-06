/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, isPrivate } = require("../lib/");
const { getJson } = require('./client/');

System({
    pattern: "allplugin",
    fromMe: isPrivate,
    desc: "To get all plugin of jarvis-md",
    type: "support"
}, async (message) => {
    return await message.reply('*Find Your Favourite Plugins*\n\n*Browse plugins, copy your favourite, and install it. You can also add your own plugins!*\n\n*Explore and Sign Up:*\n\nhttps://jarvis-md.vercel.app/plugins');
});


System({
    pattern: "repo",
    fromMe: isPrivate,
    desc: "the bot repo link",
    type: "support"
}, async (message) => {
    const data = await getJson("https://api.github.com/repos/Loki-Xer/jarvis");
    const text = `\n${data.description || ""}\n\n\n▢ *Stars:* ${data.stargazers_count}\n▢ *Forks:* ${data.forks_count}\n▢ *Watchers:* ${data.watchers_count}\n▢ *Language:* ${data.language}\n▢ *Open Issues:* ${data.open_issues_count}\n\n*Repo:* ${data.html_url}\n*Deploy:* https://jarvis-md.vercel.app/\n`;
    return await message.send(text);
});
