/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const { System, isPrivate, config, ig } = require("../lib/");
const { IronMan, getJson } = require('./client/');

System({
  pattern: 'ig',
  fromMe: isPrivate,
  desc: 'Instagram profile details',
  type: 'stalk',
}, async (m, match) => {
  if (!match) return m.reply("*Need a username*\n_Example: .ig sedboy.am_");
  const { status, msg } = await ig(encodeURIComponent(match.trim()));
  if (status === 404 || status === 429 || status !== 200) return m.reply(msg || "Profile not found.");
  const cap = '\n'
    + '➤ *Username    :* ' + msg.username + '\n'
    + '➤ *Display Name:* ' + msg.displayName + '\n'
    + '➤ *Followers   :* ' + msg.followers + '\n'
    + '➤ *Following   :* ' + msg.following + '\n'
    + '➤ *Posts       :* ' + msg.posts + '\n\n'
    + '*Bio:*\n' + (msg.bio || '_No bio available_') + '\n'
  await m.send({ url: msg.profilePic || 'https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png' }, { caption: cap, quoted: m, footer: '*JARVIS-MD*' }, "image");
});


System({
    pattern: 'gitinfo',
    fromMe: isPrivate,
    desc: 'github user details',
    type: 'stalk',
}, async (message, match) => {
    if (!match) return await message.reply("*_Need Github UserName_*");   
    const data = await getJson(`https://api.github.com/users/${match}`);
    const GhUserPP = data.avatar_url || "https://graph.org/file/924bcf22ea2aab5208489.jpg";
    const userInfo = `\n⎔ *Username* : ${data.login} \n⎔ *Name* : ${data.name || "Not Available"} \n⎔ *Bio* : ${data.bio || "Not Available"} \n\n➭ *ID* : ${data.id}\n➭ *Followers* : ${data.followers}\n➭ *Following* : ${data.following}\n➭ *Type* : ${data.type}\n➭ *Company* : ${data.company || "Not Available"}\n➭ *Public Repos* : ${data.public_repos}\n➭ *Public Gists* : ${data.public_gists}\n➭ *Email* : ${data.email || "Not Available"}\n➭ *Twitter* : ${data.twitter_username || "Not Available"}\n➭ *Location* : ${data.location || "Not Available"}\n➭ *Blog* : ${data.blog || "Not Available"}\n➭ *Profile URL* : ${data.html_url}\n➭ *Created At* : ${data.created_at}\n\n`;
    await message.send({ url: GhUserPP }, { caption: userInfo }, "image");
});

System({
  pattern: 'tkt',
  fromMe: isPrivate,
  desc: 'TikTok Stalk',
  type: 'stalk',
}, async (message, match) => {
  if (!match) return await message.reply("*Need a TikTok username*");
  const response = await fetch(IronMan(`ironman/stalk/tiktok?id=${encodeURIComponent(match)}`));
  const data = await response.json();
  const { user, stats } = data;
  const caption = `*⭑⭑⭑⭑ᴛɪᴋᴛᴏᴋ ꜱᴛᴀʟᴋ ʀᴇꜱᴜʟᴛ⭑⭑⭑⭑*\n\n`
    + `*➥ᴜꜱᴇʀɴᴀᴍᴇ:* ${user.uniqueId}\n`
    + `*➥ɴɪᴄᴋɴᴀᴍᴇ:* ${user.nickname}\n`
    + `*➥ʙɪᴏ:* ${user.signature}\n`
    + `*➥ᴠᴇʀɪꜰɪᴇᴅ:* ${user.verified}\n`
    + `*➥ꜰᴏʟʟᴏᴡᴇʀꜱ:* ${stats.followerCount}\n`
    + `*➥ꜰᴏʟʟᴏᴡɪɴɢ:* ${stats.followingCount}\n`
    + `*➥ʜᴇᴀʀᴛꜱ:* ${stats.heartCount}\n`
    + `*➥ᴠɪᴅᴇᴏꜱ:* ${stats.videoCount}`;
  await message.send({ url: user.avatarLarger }, { caption }, "image");
});

System({
    pattern: 'telegram',
    fromMe: isPrivate,
    desc: 'telegram profile details',
    type: 'stalk',
}, async (message, match) => {
    if (!match) return await message.reply("*Need a username*\n_Example: .telegram @TGMovies2Bot_");
    const { result } = await getJson(api + "stalk/telegram?query=" + match)
    return message.reply({ url: result.profile }, { caption: `*User name :* ${result.userName}\n*Nick name :* ${result.nickName}\n*About :* ${result.about}\n*Via telegram :* ${result.telegram}`}, "image")
});


System({
  pattern: 'gm',
  fromMe: isPrivate,
  desc: 'Gmail profile details',
  type: 'stalk',
}, async (m, match) => {
  if (!match) return m.reply("*Need an email*\n_Example: .gm user@gmail.com_");
  const { result: p } = await getJson(`${api}stalk/gmail?query=${encodeURIComponent(match.trim())}`) || {};
  if (!p?.email) return m.reply("Profile not found.");
  const cap = '*Gmail stalk 🔮*\n\n' + Object.entries({
    Email: p.email, ID: p.googleID, Edit: p.lastEditProfile, Type: p.userTypes,
    Chat: p.googleChat?.customerID, Plus: p.googlePlus?.enterpriseUser,
    Maps: p.mapsData?.profilePage, IP: p.ipAddress, Cal: p.calendar
  }).filter(([_, v]) => v).map(([k, v]) => `*${k}:* ${v}`).join('\n');
  await m.send({ url: p.photoProfile || 'https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png' }, { caption: cap, quoted: m, footer: '*JARVIS-MD*' }, "image");
});
