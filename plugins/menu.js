/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const plugins = require("../lib/system");
const { System, isPrivate, config } = require("../lib");
const { hostname, uptime } = require("os");
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

    
    
    let menu = `╭━━━〔 ${config.BOT_INFO.split(';')[0]} ⁩〕━━━┈⊷
┃⛯╭──────────────
┃⛯│ *owner* :  ${config.BOT_INFO.split(';')[0]}
┃⛯│ *user* : ${message.pushName.replace(/[\r\n]+/gm, "")}
┃⛯│ *plugins* : ${plugins.commands.length}
┃⛯│ *prefix* : ${message.prefix}
┃⛯│ *date* : ${date}
┃⛯│ *time* : ${time}
┃⛯│ *uptime* : ${clockString(uptime())} 
┃⛯│ *version* : ᴠ${version}
┃⛯╰──────────────
╰━━━━━━━━━━━━━━━┈⊷
${await readMore()}
╭━━━━━━━━━━━━━━━┈⊷\n╽`;
    let cmnd = [];
    let cmd;
    let category = [];
    plugins.commands.map((command, num) => {
        if (command.pattern) {
            cmd = command.pattern.toString().match(/(\W*)([A-Za-züşiğ öç1234567890]*)/)[2];
        }

        if (!command.dontAddCommandList && cmd !== undefined) {
            let type;
            if (!command.type) {
                type = "misc";
            } else {
                type = command.type.toLowerCase();
            }
            
            if (filterType && type !== filterType) return;

            cmnd.push({
                cmd,
                type: type
            });

            if (!category.includes(type)) category.push(type);
        }
    });
    cmnd.sort();
    category.sort().forEach((cmmd) => {
        menu += `
┃  ╭─────────────┈⊷
┃  │  *${cmmd} ⏎*
┃  ╰┬────────────┈⊷
┃  ┌┤`;
        let comad = cmnd.filter(({ type }) => type == cmmd);
        comad.forEach(({ cmd }, num) => {
            menu += `\n┃  │ ☍  *${cmd.trim()}*`;
        });
        menu += `\n┃  ╰─────────────┈⊷`;
    });

    menu += ` ╰━━━━━━━━━━━┈⊷\n`;
    menu += `\nMade with 🤍`;

    let url = `${config.BOT_INFO.split(';')[2]}`;
    

    if (isUrl(url)) {
    let options = config.BOT_INFO.includes('&gif') ? { gifPlayback: true, caption: menu } : { caption: menu };  
    url = url.replace(/&gif/g, '');
        return await message.sendFromUrl(url,
          options)
    } else {
        return await message.send(menu);
    }
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
    if (config.MEDIA_DATA) {
        const [title, body, thumbnail] = config.MEDIA_DATA.split(";");
        await message.sendFromUrl(thumbnail, { caption: menu })
    } else {
        await message.send(menu);
    }
});