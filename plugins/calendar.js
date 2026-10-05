/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, isPrivate, getMalayalamDate } = require("../lib/");
const WEEKDAYS = [['ഞായർ', 'Sunday'], ['തിങ്കൾ', 'Monday'], ['ചൊവ്വ', 'Tuesday'], ['ബുധൻ', 'Wednesday'], ['വ്യാഴം', 'Thursday'], ['വെള്ളി', 'Friday'], ['ശനി', 'Saturday']];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const GREETINGS = [[12, 'സുപ്രഭാതം', 'Good Morning'], [17, 'ശുഭ ഉച്ച', 'Good Afternoon'], [20, 'ശുഭ സായാഹ്നം', 'Good Evening'], [24, 'ശുഭ രാത്രി', 'Good Night']];

System({
    pattern: "calendar",
    fromMe: isPrivate,
    desc: "Send today's calendar",
    type: "tools"
}, async (msg, match) => {
  const USE_MALAYALAM = match.includes('ml');
  const panchang = getMalayalamDate();
  const today = new Date();
  const [dayMl, dayEn] = WEEKDAYS[today.getDay()];
  const [, greetMl, greetEn] = GREETINGS.find(([limit]) => today.getHours() < limit);
  const dateEn = `${MONTHS[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  const text = USE_MALAYALAM ? `🌸 *${greetMl}!* 🌸\n\n📅 *മലയാളം പഞ്ചാംഗം*\n\n🗓️ *${panchang.date} ${panchang.month} ${panchang.year}*\n_${panchang.date} ${panchang.monthEn} ${panchang.year}_\n\n📆 ദിവസം: *${dayMl}*\n⭐ നക്ഷത്രം: *${panchang.nakshatram}*\n_${panchang.nakshatramEn}_${panchang.festival ? `\n\n🎉 *വിശേഷ ദിനം*\n🪔 *${panchang.festival}*\n_${panchang.festivalEn}_` : ''}\n\n🙏 _നല്ലൊരു ദിവസം ആശംസിക്കുന്നു!_` : `🌸 *${greetEn}!* 🌸\n\n📅 *Daily Calendar*\n\n🗓️ *${dateEn}*\n_${dayEn}_\n\n📆 Day: *${dayEn}*\n⭐ Nakshatram: *${panchang.nakshatramEn}*${panchang.festival ? `\n\n🎉 *Special Day*\n🪔 *${panchang.festivalEn}*` : ''}\n\n🙏 _Wishing you a wonderful day!_`;
  return msg.send(text);
});
