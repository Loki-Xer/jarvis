/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const plugins = require("../lib/system");
const { System, isPrivate, config } = require("../lib");
const { BOT_INFO, MEDIA_DATA, MENU_FONT } = require("../config");
const { uptime } = require("os");
const { version } = require('../package.json');
const fancy = require('./client/fancy');
const { isUrl, readMore, clockString } = require('./client/');

System({
    pattern: 'menu',
    fromMe: isPrivate,
    dontAddCommandList: true
}, async (message, match) => {
    let [date, time] = new Date().toLocaleString("en-IN", { timeZone: config.TIMEZONE }).split(",");
    
    let filterType = match ? match.trim().toUpperCase() : null;

    let menu = `╭━━━〔 ${BOT_INFO.split(';')[0]} ⁩〕━━━···▸\n┃╭──────────────···▸\n✧│ *ᴏᴡɴᴇʀ :*  ${BOT_INFO.split(';')[1]}\n✧│ *ᴜsᴇʀ :* ${message.pushName.replace(/[\r\n]+/gm, "")}\n✧│ *ᴘʟᴜɢɪɴs :* ${plugins.commands.length}\n✧│ *ᴅᴀᴛᴇ :* ${date}\n✧│ *ᴛɪᴍᴇ :* ${time}\n✧│ *ᴜᴘᴛɪᴍᴇ :* ${clockString(uptime())}\n✧│ *ᴠᴇʀsɪᴏɴ :* ᴠ${version}\n┃╰──────────────···▸\n╰━━━━━━━━━━━━━━━···▸\n\n\n${await readMore()}\n╭━━━━━━━━━━━━━━━···▸\n╽`;

    let cmnd = [], category = [];
    for (const command of plugins.commands) {
        const cmd = command.pattern?.toString().match(/(\W*)([A-Za-züşiğ öç1234567890]*)/)?.[2];
        if (!command.dontAddCommandList && cmd) {
            const type = (command.type || "misc").toUpperCase();

            if (filterType && type !== filterType) continue;

            cmnd.push({ cmd, type });
            if (!category.includes(type)) category.push(type);
        }
    }

    if (filterType && cmnd.length === 0) {
        return await message.send(`No commands found for category *${filterType}*.`);
    }

    const [typFont, ptrnFont] = MENU_FONT.split(';').map(font => isNaN(font) || parseInt(font) > 35 ? null : font);
    cmnd.sort();
    for (const cmmd of category.sort()) {
        let typ;
        if (typFont && typFont !== '0') {
            typ = await fancy.apply(fancy[parseInt(typFont)-1], cmmd);
        } else {
            typ = cmmd.toUpperCase();
        }

        menu += `\n┃  ╭─────────────┅┄▻\n┃  │  *➻ ${typ}*\n┃  ╰┬────────────┅┄▻\n┃  ┌┤`;
        for (const { cmd, type } of cmnd.filter(({ type }) => type === cmmd)) {
            let ptrn;
            if (ptrnFont && ptrnFont !== '0') {
                ptrn = await fancy.apply(fancy[parseInt(ptrnFont)-1], cmd.trim().toUpperCase());
            } else {
                ptrn = cmd.charAt(0).toUpperCase() + cmd.slice(1).toLowerCase();
            }
            menu += `\n┃  │ ‣ ${ptrn}`;
        }
        menu += `\n┃  ╰─────────────···▸`;
    }
    menu += ` ╰━━━━━━━━━━━┈⊷\nmade with 🤍`;

    let url = BOT_INFO.split(';')[2];
    let options = BOT_INFO.includes('&gif') ? { gifPlayback: true, caption: menu } : { caption: menu };  
    url = url.replace(/&gif/g, '');
    if (isUrl(url)) {
        return await message.sendFromUrl(url, options);
    } else {
        return await message.send(menu);
    };
});

System({
    pattern: "list",
    fromMe: isPrivate,
    dontAddCommandList: true
}, async (message, match) => {
    if (match === "cmd") return;
    let menu = "\nمصنوع من🤍\n\n";
    let cmnd = plugins.commands.filter(command => !command.dontAddCommandList && command.pattern);
    cmnd = cmnd.map(command => ({
        cmd: command.pattern.toString().match(/(\W*)([A-Za-züşiğ öç1234567890]*)/)[2],
        desc: command.desc || false
    }));
    cmnd.sort((a, b) => a.cmd.localeCompare(b.cmd));
    cmnd.forEach(({ cmd, desc }, num) => {
        menu += `*${(num + 1)}. ${cmd.trim()}*\n${desc ? `*use: ${desc}*\n\n\n` : '\n\n'}`;
    });
    if (MEDIA_DATA) {
        const [title, body, thumbnail] = MEDIA_DATA.split(";");
        await message.sendFromUrl(thumbnail, { caption: menu })
    } else {
        await message.send(menu);
    }
});
