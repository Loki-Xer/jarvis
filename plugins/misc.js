/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const {
    gtts,
    isJid,
    System,
    config,
    toAudio,
    isPrivate 
} = require("../lib/");
const { isUrl, extractUrlsFromText } = require('./client/');
  
  
System({
    pattern: "wm",
    fromMe: isPrivate,
    desc: "wame generator",
    type: "misc",
}, async (message, match) => {
    if (!message.quoted) return message.reply("_*Reply to a user*_");
    let sender = message.reply_message?.sender || message.mention?.[0] || message.text;
    if (!isJid(sender)) return message.reply("*Can't find number*");
    return await message.reply('https://wa.me/' + sender.split('@')[0]);
});


System({
  pattern: 'ss',
  fromMe: true,
  desc: 'Takes a screenshot of a website',
  type: 'misc',
}, async (message, match) => {
  let url = (await extractUrlsFromText(match || message.reply_message.text))[0];
  if (!url) return await message.reply(`*Please provide a URL*`);
  if (!isUrl(url)) return await message.reply(`*Please provide a valid URL*`);
  return await message.sendFromUrl(api + "tools/ssweb?q=" + url, { caption: `*Screenshot of ${url}*` });
});

  System({
      pattern: "save", 
      fromMe: true,
      desc: "used to save messages", 
      type: "misc",
  }, async (message) => {
     if (!message.quoted) return;
     return await message.client.forwardMessage(message.user.jid, message.reply_message.data);
  });


System({
    pattern: 'whois',
    fromMe: isPrivate,
    desc: 'to find who is',
    type: 'whatsapp',
}, async (message, match) => {
    const num = (match || '').replace(/[^0-9]/g, '');
    let user = message.mention?.jid?.[0]
        || (message.quoted ? message.reply_message.sender : (num ? `${num}@s.whatsapp.net` : ''))
        || (message.isPm ? message.jid : '');
    if (!user) return message.reply('_Reply to someone or mention_\n*Example:* .whois @user');

    let [pp, name] = await Promise.all([message.getPP(user), message.store.getName(user)]);
    let [statusObj] = await message.client.fetchStatus(user).catch(() => ([{ status: 'private' }]));
    let aboutText = (statusObj?.status && statusObj.status.status) || 'private';
    let setAtDate = statusObj?.status && statusObj.status.setAt;
    let formattedSetAt = setAtDate ? new Date(setAtDate).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : 'Not available';
    
    const business = await message.client.getBusinessProfile(user).catch(() => null);
    const isBusiness = !!(business && business.wid);

    let caption = `*Name:* ${name}\n`;
    caption += `*About:* ${aboutText}\n*About Set Date:* ${formattedSetAt}\n`;
    caption += `*WhatsApp:* https://wa.me/${user.split('@')[0]}\n`;
    caption += `*Account Type:* ${isBusiness ? 'Business 💼' : 'Personal 👤'}`;

    if (isBusiness) {
        const toTime = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        const hours = (business.business_hours?.business_config || []).map(d => {
            if (d.mode === 'open_24h') return `${d.day_of_week}: 24 hours`;
            if (d.mode === 'appointment_only') return `${d.day_of_week}: by appointment`;
            return `${d.day_of_week}: ${toTime(d.open_time)} - ${toTime(d.close_time)}`;
        }).join('\n');

        caption += `\n\n*── Business Info ──*`;
        if (business.category) caption += `\n*Category:* ${business.category}`;
        if (business.description) caption += `\n*Description:* ${business.description}`;
        if (business.address) caption += `\n*Address:* ${business.address}`;
        if (business.email) caption += `\n*Email:* ${business.email}`;
        if (business.website?.length) caption += `\n*Website:* ${business.website.join('\n')}`;
        if (business.business_hours?.timezone) caption += `\n*Timezone:* ${business.business_hours.timezone}`;
        if (hours) caption += `\n*Hours:*\n${hours}`;
    }

    return await message.send({ url: pp }, { caption, quoted: message }, 'image');
});
  
  System({
      pattern: 'tts',
      fromMe: isPrivate,
      desc: 'It converts text to sound.',
      type: 'converter'
  }, async (message, match) => {
      if (!(match || message.reply_message.text)) return await message.reply('_Need Text!_\n_Example: tts Hello_\n_tts Hello {en}_');
      let LANG = config.LANG.toLowerCase();
      const lang = match.match("\\{([a-z]+)\\}");
      if (lang) {
        match = match.replace(lang[0], '');
        LANG = lang[1];
        if (message.reply_message.text) match = message.reply_message.text;
      }
      const response = await gtts(match, LANG);
      const audio = await toAudio(response, 'opus');
      return await message.reply(audio, { mimetype: 'audio/ogg; codecs=opus', ptt: true }, "audio");
  });
  
