const { System, setSchedule, getSchedule, delSchedule, bot } = require('../lib/');
const { parsedJid, formatDateTime, reformatDateTime } = require("./client/"); 


System({ 
    pattern: "setschedule", 
    fromMe: true, 
    desc: 'To set Schedule Message',
    type: 'manage'
}, async (message, match) => {
    if (!message.quoted) return await message.send('*Reply to a Message, which is scheduled to send*');
    if (!match.includes(',')) return message.reply("-> *Example :*\n*setschedule jid, HH:MM AM/PM (time) DAY-MONTH-YEAR*\n-> *Example :.setschedule xxx@s.whatsapp.net,10:30 PM 19-11-2024*");    
    const [id, time] = match.split(',')
    const [jid] = await parsedJid(id);
    const newFormat = formatDateTime(time.trim());
    if (!jid || !newFormat) return message.reply("-> *Example :*\n*setschedule jid, HH:MM AM/PM (time) DAY-MONTH-YEAR*\n-> *Example :.setschedule xxx@s.whatsapp.net,10:30 PM 19-11-2024*"); 
    await setSchedule(jid, newFormat, "true", message.reply_message.message);
    await message.send(`_successfully scheduled to send at ${time}_`);
    bot.restart();
});

System({
  pattern: "getschedule",
  fromMe: true,
  desc: 'To get all Schedule Messages',
  type: 'manage',
}, async (message) => {
  const { data } = await getSchedule();
  if (data.length === 0) return await message.reply("_No Schedule Message Found_");  
  const responseText = `*Schedule Message List*\n\n${(await Promise.all(data.map(async (item) => {
        const date = reformatDateTime(item.date) || "Invalid Date";
        const contentType = Object.keys(item.content || {})[0] || 'unknown';
        return `*Jid:* ${item.jid}\n*Date:* ${date}\n*Message Type:* ${contentType}`;
  }))).join("\n\n")}`;
  await message.reply(responseText);
});


System({ 
    pattern: "delschedule", 
    fromMe: true, 
    desc: 'To delete Schedule Message',
    type: 'manage'
}, async (message, match) => {
    if (!match) return message.reply("-> *Example : delschedule jid, HH:MM AM/PM (time) DAY-MONTH-YEAR*\n->*.delschedule xxx@s.whatsapp.net,10:30 PM 19-11-2024*"); 
    if (!match.includes(',')) return message.reply("-> *Example : delschedule jid, HH:MM AM/PM (time) DAY-MONTH-YEAR*\n->*.delschedule xxx@s.whatsapp.net,10:30 PM 19-11-2024*");    
    const [id, time] = match.split(',')
    const [jid] = await parsedJid(id);
    const newFormat = formatDateTime(time.trim());
    if (!jid || !newFormat) return message.reply("-> *Example : delschedule jid, HH:MM AM/PM (time) DAY-MONTH-YEAR*\n->*.delschedule xxx@s.whatsapp.net,10:30 PM 19-11-2024*");
    const schedule = await delSchedule(jid, newFormat);
    if(!schedule.status) return await message.send('_Schedule not found_');
    await message.send('_Schedule deleted_');
    bot.restart();
});