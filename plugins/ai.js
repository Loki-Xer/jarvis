/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, isPrivate, chatgpt, gemini, chatgpt } = require("../lib/");
const { elevenlabs } = require("./client/");

System({
    pattern: "chatgpt", 
    fromMe: isPrivate,
    desc: "ai chatgpt", 
    type: "ai",
}, async (m, match) => {
   match = match || m.reply_message?.text;
   if(match && m.quoted) match += "\n" + m.reply_message.text;
   if(!match) return m.reply("_*need query !!*_\n_*eg: .chatgpt create a simple html page*_");
   const res = await chatgpt(match);
   const msg = await m.send(res.response, { contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: "120363197401188542@newsletter", newsletterName: "chatgpt" }}});
});

System({
   pattern: 'gemini',
   fromMe: isPrivate,
   desc: 'Chat with gemini ai',
   type: 'ai',
}, async (message, match) => {
  match = match || message.reply_message.text;
  if (!(match || message.quoted) || (message.quoted && !message.reply_message.image)) return message.reply("_*Need Prompt !!*_\n_*eg: .gemini who is iron man?*_\n _For image you have to Reply to an image and also give a prompt_");
  const path = message.quoted && message.reply_message?.image ? await message.reply_message.downloadAndSaveMedia() : null;
  const res = await gemini(match, path);
  await message.send(res, { contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363197401188542@newsletter', newsletterName: 'ɢᴇᴍɪɴɪ ᴀɪ' } } });
});

System({
    pattern: "aitts",
    fromMe: isPrivate,
    desc: 'generate ai voices',
    type: "ai"
}, async (message, match) => {
   if (match == 'list') 
   return await message.send(` *List of Aitts*\n\n 1 _rachel_ \n 2 _clyde_ \n 3 _domi_ \n 4 _dave_ \n 5 _fin_ \n 6 _bella_ \n 7 _antoni_ \n 8 _thomas_ \n 9 _charlie_ \n 10 _emily_ \n 11 _elli_ \n 12 _callum_ \n 13 _patrick_ \n 14 _harry_ \n 15 _liam_ \n 16 _dorothy_ \n 17 _josh_ \n 18 _arnold_ \n 19 _charlotte_ \n 20 _matilda_ \n 21 _matthew_ \n 22 _james_ \n 23 _joseph_ \n 24 _jeremy_ \n 25 _michael_ \n 26 _ethan_ \n 27 _gigi_ \n 28 _freya_ \n 29 _grace_ \n 30 _daniel_ \n 31 _serena_ \n 32 _adam_ \n 33 _nicole_ \n 34 _jessie_ \n 35 _ryan_ \n 36 _sam_ \n 37 _glinda_ \n 38 _giovanni_ \n 39 _mimi_ \n`.replace(/├/g, ''));
   const [v, k] = match.split(/,;|/);
   if (!k && !v) return await message.send(`*_need voice id and text_*\n_example_\n\n_*aitts* hey vroh its a test,adam_\n_*aitts list*_`)
   const stream = await elevenlabs(match)
   if (!stream) return await message.send(`_*please upgrade your api key*_\n_get key from http://docs.elevenlabs.io/api-reference/quick-start/introduction_\n_example_\n\nsetvar elvenlabs: your key\n_or update your config.js manually_`);
   return await message.send({ stream }, { mimetype: 'audio/mpeg' }, 'audio');
});
