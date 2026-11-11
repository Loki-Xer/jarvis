/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, changeVar, setData, config: Config, platform: { heroku, koyeb, render, railway }, bot, isLid, shell } = require("../lib/");
const REPO_URL = "https://github.com/Loki-Xer/jarvis.git";
const { version } = require('../package.json');
const simpleGit = require("simple-git");
const fs = require('fs');
const pm2 = require("pm2");
const git = simpleGit();

const SECRET_REGEX = /(KEY|TOKEN|SESSION|SECRET|PASSWORD|DATABASE|API)/i;
const isSecret = (key) => SECRET_REGEX.test(key);

System({
    pattern: "config",
    fromMe: true,
    type: "server",
    desc: "Show all configuration variables",
}, async (message) => {
    const vars = { ...Config };
    delete vars.DATABASE;
    delete vars.ALIVE_DATA;
    delete vars.GOODBYE_MSG;
    delete vars.WELCOME_MSG;
    if (message.client.server !== "HEROKU") {
        delete vars.HEROKU_API_KEY;
        delete vars.HEROKU_APP_NAME;
    };
    if (message.client.server !== "KOYEB") {
        delete vars.KOYEB_API;
        delete vars.KOYEB_APP_NAME;
    };
    if (message.client.server !== "RENDER") {
        delete vars.RENDER_API;
        delete vars.RENDER_APP_NAME;
    };
    if (message.client.server !== "RAILWAY") {
        delete vars.RAILWAY_API;
    };
    const keys = Object.keys(vars);
    let text = "*「 ALL CONFIG VARIABLES 」*\n\n";
    for (const key of keys) {
        const value = vars[key];
        text += `*${key}*: ${isSecret(key) ? "[HIDDEN]" : value ?? "[NOT SET]"}\n\n`;
    };
    text += `\n*Total Variables:* ${keys.length}`;
    return await message.reply(text);
});

System({
    pattern: "(shutdown|poweroff)",
    fromMe: true,
    type: "server",
    desc: "shutdown bot",
}, async (message) => {
    await message.reply(`_Jarvis is shutting down..._`);
    return await bot.stop();
});

System({
  pattern: "setvar",
  fromMe: true,
  type: "server",
  desc: "Set environment variable",
}, async (m, match) => {
  if (!match) return await m.reply(`Example: .setvar SUDO:917025673121`);
  const [key, ...part] = match.split(":");
  const value = part.join(":").trim();
  if (!key || !value) return await m.send(`_*Example: .setvar SUDO:917025673121*_`);
  const KEY = key.trim().toUpperCase();
  if (m.client.server === "HEROKU") {
    await m.send(`_*Updated variable ${KEY}: ${value}*_`);
    const env = await heroku.setVar(KEY, value);
    if (!env) return await m.reply("*Error in changing variable*");
  } else if (m.client.server === "RENDER") {
    await m.send(`*_Successfully Set_* *${KEY}:${value}*\n_ReDeploying..._`);
    await render.setVar(KEY, value);
  } else if (m.client.server === "KOYEB") {
    const koyebEnv = await koyeb.setVar(KEY, value);
    await m.reply(koyebEnv);
  } else if (m.client.server === "RAILWAY") {
    await railway.setVar(KEY, value, m);
  } else {
    const env = await changeVar(KEY, value);
    if (!env) return await m.send("*Error in changing variable*");
    await setData(KEY, value, !!value, "vars");
    await m.reply(`_*Environment variable ${KEY} set to ${value}*_`);
    await bot.restart();
    return m;
  }
});

System({
    pattern: "(platform|server)",
    fromMe: true,
    type: "server",
    desc: "Show which platform you deployed",
}, async (msg) => {
    const server = String(msg.client.server || "unknown");
    return await msg.reply("_*You are deployed on " + server.charAt(0).toUpperCase() + server.slice(1).toLowerCase() + "*_");
});

System({
    pattern: "delvar",
    fromMe: true,
    type: "server",
    desc: "Delete environment variable",
}, async (message, match) => {
    if (!match) return await message.reply("_Example: delvar sudo_");
    const key = match.trim().toUpperCase();
    if (message.client.server === "HEROKU") {
      await message.reply(`_*deleted var ${key}*_`);
      const env = await heroku.setVar(key, null);
      if (!env) return await message.reply("*Error in deleting variable*");
    } else if (message.client.server === "RENDER") {
      await message.send(`*_Successfully Deleted_* *${key}*\n_ReDeploying..._`);
      await render.delVar(key);
    } else if (message.client.server === "KOYEB") {
      await koyeb.setVar(key, null);
      await message.reply(`_*deleted var ${key}*_`);
    } else if (message.client.server === "RAILWAY") {
      await railway.setVar(key, null, message);
    } else {
      const env = await changeVar(key, "");
      if (!env) return await message.reply("*Error in deleting variable*");
      await setData(key, null, false, "vars");
      await message.reply(`_*deleted var ${key}*_`);
      await bot.restart();
    }
});

System({
    pattern: "(allvar|allenv) ?(.*)",
    fromMe: true,
    type: "server",
    desc: "all environment variables",
}, async (message, match) => {
    const vars = { ...Config };
    delete vars.DATABASE;
    delete vars.ALIVE_DATA;
    delete vars.GOODBYE_MSG;
    delete vars.WELCOME_MSG;
    if (message.client.server !== "HEROKU") {
        delete vars.HEROKU_API_KEY;
        delete vars.HEROKU_APP_NAME;
    }
    if (message.client.server !== "KOYEB") {
        delete vars.KOYEB_API;
        delete vars.KOYEB_APP_NAME;
    }
    if (message.client.server !== "RENDER") {
        delete vars.RENDER_API;
        delete vars.RENDER_APP_NAME;
    }
    if (message.client.server !== "RAILWAY") {
        delete vars.RAILWAY_API;
    }
    const showAll = match && match.trim() === "all";
    let s = '\n*All Your Vars*\n\n';
    for (const key in vars) {
        if (showAll || process.env[key]) {
            const val = isSecret(key) ? "[hidden]" : vars[key];
            s += `*${key}*: ${val}\n\n`;
        }
    }
    return await message.reply(s);
});

System({
    pattern: "(getvar|getenv)",
    fromMe: true,
    type: "server",
    desc: "Show env",
}, async (message, match) => {
    if (!match || !match.trim()) return await message.reply("_*eg: getvar sudo*_");
    const requestedVar = match.trim().toUpperCase();
    if (Object.prototype.hasOwnProperty.call(process.env, requestedVar) || Object.prototype.hasOwnProperty.call(Config, requestedVar)) {
        const value = isSecret(requestedVar) ? "[hidden]" : (process.env[requestedVar] || Config[requestedVar]);
        return await message.reply(`*${requestedVar}*: ${value}`);
    };
    return await message.reply(`_*Variable '${requestedVar}' not found.*_`);
});

System({
    pattern: "(getsudo|getadmins)",
    fromMe: true,
    type: "server",
    desc: "shows sudo",
}, async (message) => {
    return await message.reply("_*SUDO NUMBER'S ARE :*_ " + "```" + Config.SUDO + "```");
});

System({
    pattern: "dyno",
    fromMe: true,
    type: "server",
    desc: "Show Quota info of heroku",
}, async (message) => {
    if (message.client.server !== "HEROKU") return await message.reply(`_this cmd for heroku_`);
    if (!Config.HEROKU_API_KEY) return await message.send("*Can't find HEROKU_API_KEY*");
    return await message.reply(await heroku.dyno());
});

System({
    pattern: "setsudo",
    fromMe: true,
    desc: "set sudo",
    type: "server"
}, async (message, match) => {
    let newSudo;
    if (message.isPm) {
      if (isLid(message.jid)) return await message.reply("*Sorry can't find the number please enter it !*");
      newSudo = message.jid.split("@")[0];
    } else if (message.mention && message.mention.jid && message.mention.jid[0]) {
      if (isLid(message.mention.jid[0])) return await message.reply("*Sorry can't find the number please enter it !*");
      newSudo = message.mention.jid[0].split("@")[0];
    } else if (message.reply_message && message.reply_message.sender) {
      if (isLid(message.reply_message.sender)) return await message.reply("*Sorry can't find the number please enter it !*");
      newSudo = message.reply_message.sender.split("@")[0];
    } else {
      newSudo = null;
    }
    if (!newSudo && !match) return await message.reply("_Reply to someone/mention_\n*Example:* . setsudo @user");
    const sudoNumbers = String(Config.SUDO || "").split(",").map(num => num.replace(/\D/g, "")).filter(Boolean);
    if (newSudo) {
        newSudo = newSudo.replace(/\D/g, "");
        if (newSudo && !sudoNumbers.includes(newSudo)) {
            sudoNumbers.push(newSudo);
        }
    }
    if (match) {
        const extraNumbers = String(match).split(",").map(num => num.replace(/\D/g, "")).filter(Boolean);
        for (const num of extraNumbers) {
            if (!sudoNumbers.includes(num)) {
                sudoNumbers.push(num);
            }
        }
    }
    const setSudo = sudoNumbers.join(",");
    await message.reply("*New sudo numbers are:*\n" + (setSudo || "None"));
    await message.reply("_It takes 30 seconds to take effect._");
    if (message.client.server === "HEROKU") {
      const env = await heroku.setVar("SUDO", setSudo);
      if (!env) return await message.reply("*Error set sudo*");
    } else if (message.client.server === "KOYEB") {
      await koyeb.setVar("SUDO", setSudo);
    } else if (message.client.server === "RENDER") {
      await render.setVar("SUDO", setSudo);
    } else if (message.client.server === "RAILWAY") {
      await railway.setVar("SUDO", setSudo, message);
    } else {
      const env = await changeVar("SUDO", setSudo);
      if (!env) return await message.send("*Error set sudo*");
      await setData("SUDO", setSudo, !!setSudo, "vars");
      await bot.restart();
    }
});

System({
  pattern: "delsudo",
  fromMe: true,
  desc: "delete sudo",
  type: "server",
}, async (m, text) => {
  let sudoNumber = m.quoted ? m.reply_message?.sender : text;
  if (!sudoNumber) return await m.send("*Need reply/mention/number*");
  sudoNumber = String(sudoNumber).split("@")[0].replace(/\D/g, "");
  if (!sudoNumber) return await m.send("*Need reply/mention/number*");
  const sudoList = String(Config.SUDO || "").split(",").map(n => n.trim()).filter(Boolean);
  const newSudoList = sudoList.filter((number) => number !== sudoNumber).join(",");
  await m.send(`NEW SUDO NUMBERS ARE: \n\`\`\`${newSudoList}\`\`\``, { quoted: m.data });
  await m.send("_IT TAKES 30 SECONDS TO MAKE EFFECT_", { quoted: m });
  if (m.client.server === "HEROKU") {
    const env = await heroku.setVar("SUDO", newSudoList);
    if (!env) return await m.reply("*Error set sudo*");
  } else if (m.client.server === "KOYEB") {
    await koyeb.setVar("SUDO", newSudoList);
  } else if (m.client.server === "RENDER") {
    await render.setVar("SUDO", newSudoList);
  } else if (m.client.server === "RAILWAY") {
    await railway.setVar("SUDO", newSudoList, m);
  } else {
    const env = await changeVar("SUDO", newSudoList);
    if (!env) return await m.send("*Error set sudo*");
    await setData("SUDO", newSudoList, !!newSudoList, "vars");
    await bot.restart();
  }
});


System({
    pattern: "update",
    fromMe: true,
    type: "server",
    desc: "Checks for update.",
  }, async (message, match) => {
    try {
      const server = message.client.server;
      const branch = Config.BRANCH || "main";
      const usesGit = server !== "HEROKU" && server !== "KOYEB";
      if (!(await git.checkIsRepo())) {
        await git.init();
        await git.addRemote("origin", REPO_URL);
      } else {
        const remotes = await git.getRemotes(true);
        const origin = remotes.find((r) => r.name === "origin");
        if (!origin) await git.addRemote("origin", REPO_URL);
        else if (origin.refs.fetch !== REPO_URL) await git.remote(["set-url", "origin", REPO_URL]);
      };
      await git.fetch("origin", branch);
      const envBackup = fs.existsSync("./config.env") ? fs.readFileSync("./config.env", "utf8") : null;
      const hasHead = await git.raw(["rev-parse", "--verify", "HEAD"]).then(() => true, () => false);
      if (!hasHead && usesGit) {
        await message.reply("*Syncing bot with the repository...*");
        await git.raw(["checkout", "-f", "-B", branch, `origin/${branch}`]);
        if (envBackup) fs.writeFileSync("./config.env", envBackup);
        await message.reply("*Installing npm packages...*");
        await shell("npm install --legacy-peer-deps");
        if (server === "REPLIT") return await message.reply("_*Bot is updated, restart your application manually*_");
        await message.reply("*Updated the bot. Restarting...*");
        return setTimeout(() => process.exit(0), 1500);
      };
      const commits = hasHead ? await git.log([`HEAD..origin/${branch}`]) : { total: 0, all: [] };
      if (commits.total === 0) {
        return await message.reply(`_Jarvis is on the latest version: v${version}_`);
      };
      if (!["bot", "now", "jarvis"].includes((match || "").toLowerCase().trim())) {
        let list = "*Updates available for Jarvis-md* \n\n";
        commits.all.forEach((c, i) => (list += `${i + 1} ●  ${c.message}\n`));
        const cmd = message.prefix ? `${message.prefix} update now` : "update now";
        return await message.send(`${list}\n\n _type *${cmd}*_`);
      };
      if (server === "HEROKU") return await heroku.update(message);
      if (server === "KOYEB") {
        await message.reply("_*Building preparing 𐍮*_");
        if (await koyeb.getStatus()) {
          return await message.reply("_Please wait..._\n_Currently 2 instances are running in Koyeb, wait to stop one of them._");
        }
        return await message.reply(await koyeb.update());
      };
      await message.reply(`*Found ${commits.total} new update(s), updating...*`);
      const changed = await git.diff(["--name-only", "HEAD", `origin/${branch}`]).catch(() => "package.json");
      try {
        await git.pull("origin", branch);
      } catch {
        await message.reply("*Conflict detected. Forcing update...*");
        await git.reset(["--hard", `origin/${branch}`]);
      }
      if (envBackup) fs.writeFileSync("./config.env", envBackup);
      if (changed.includes("package.json")) {
        await message.reply("*Installing updated npm packages...*");
        await shell("npm install --legacy-peer-deps");
      };
      if (server === "REPLIT") return await message.reply("_*Bot is updated, restart your application manually*_");
      await message.reply("*Updated the bot with latest changes. Restarting...*");
      setTimeout(() => process.exit(0), 1500);
    } catch (error) {
      console.error("Update error:", error.message || error);
      await message.reply(`*Error updating bot:* \`\`\`${error.message || error}\`\`\``);
    }
  });


System({
  pattern: "restart",
  fromMe: true,
  desc: "for restart bot",
  type: "server",
}, async (message) => {
  await message.send("_*Restarting*_");
  if (message.client.server === "HEROKU") {
    await heroku.restart(message);
  } else if (message.client.server === "RENDER") {
    await render.restart();
  } else if (message.client.server === "RAILWAY") {
    await railway.restart();
  } else {
    await bot.restart();
  }
});

System({
  pattern: "mode",
  fromMe: true,
  type: "server",
  desc: "change work type",
}, async (message, value) => {
  if (!value) {
    return message.isGroup
      ? await message.send("Choose mode", { values: [{ displayText: "private", id: "mode private" }, { displayText: "public", id: "mode public" }], onlyOnce: true, withPrefix: true, participates: [message.sender] }, "poll")
      : await message.reply("_*mode private/public*_");
  }
  const workType = value.trim().toLowerCase();
  if (workType !== "public" && workType !== "private") return await message.reply("_*mode private/public*_");
  await message.send(`_*Work type changed to ${workType}*_`);
  let env;
  switch (message.client.server) {
    case "HEROKU":
      env = await heroku.setVar("WORK_TYPE", workType);
      break;
    case "KOYEB":
      env = await koyeb.setVar("WORK_TYPE", workType);
      break;
    case "RENDER":
      env = await render.setVar("WORK_TYPE", workType);
      break;
    case "RAILWAY":
      env = await railway.setVar("WORK_TYPE", workType, message);
      break;
    default:
      env = await changeVar("WORK_TYPE", workType);
      if (!env) return await message.send("*Error in changing variable*");
      await setData("WORK_TYPE", workType, !!workType, "vars");
      await bot.restart();
  }
  if (!env) return await message.reply("*Error in changing variable*");
});
