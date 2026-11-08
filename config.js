const { Sequelize } = require('sequelize');
const { loadEnv } = require("jarvis-md");
const fs = require('fs');

if (fs.existsSync('config.env')) {
  loadEnv('config.env');
};

global.api = 'https://lokixer.koyeb.app/';

const toBool = (x) => (x && (x.toLowerCase() === 'true' || x.toLowerCase() === 'on')) || false;
const DATABASE_URL = process.env.DATABASE_URL === undefined ? "./database.db" : process.env.DATABASE_URL

module.exports = {
  ALIVE_DATA : process.env.ALIVE_DATA || "_*Hy &sender i am alive now*_\n\n_PLATFORM: &platform_\n_RUNTIME : &runtime_\n\n_. type alive to update your alive message_",
  ALLWAYS_ONLINE: toBool(process.env.ALLWAYS_ONLINE || "false"),
  ANTIBOT_MSG: process.env.ANTIBOT_MSG || "```Antibot deleted successfully!!```",
  ANTILINK_MSG: process.env.ANTILINK_MSG || "```Link Not allowed in this group!!```",
  ANTIWORD_MSG: process.env.ANTIWORD_MSG || "```Antiword deleted successfully!!```",
  AUDIO_DATA: process.env.AUDIO_DATA || 'ʟᴏᴋɪ-xᴇʀ;ᴊᴀʀᴠɪꜱ;https://graph.org/file/58ea74675af7836579a3a.jpg',
  AUTOMUTE_MSG: process.env.AUTOMUTE_MSG || '_Group automuted!_',
  AUTOUNMUTE_MSG: process.env.AUTOUNMUTE_MSG || '_Group autounmuted!_',
  AUTO_DL: toBool(process.env.AUTO_DL || process.env.AUTO_DOWNLOAD),
  AUTO_REACTION: toBool(process.env.AUTO_REACTION || "false"),
  BAN_CHATS: process.env.BAN_CHATS || "",
  BOT_INFO: process.env.BOT_INFO || 'ᴊᴀʀᴠɪꜱ;ʟᴏᴋɪ-xᴇʀ;https://lokixer.onrender.com/file/irahhxhmkbdob.mp4&gif',
  BRAINSHOP: process.env.BRAINSHOP || '172372,nbjE0YAlyw3cpoMl',
  BRANCH: "main",
  CALL_BLOCK: toBool(process.env.CALL_BLOCK || "false"),
  CHANAL_REACTION: toBool(process.env.CHANAL_REACTION || "false"),
  CMD_REACTION: toBool(process.env.CMD_REACTION || 'true'),
  CONTEXTINFO: process.env.CONTEXTINFO || `{"title": "ᴊᴀʀᴠɪꜱ-ᴍᴅ", "body": "ᴀᴡᴇꜱᴏᴍᴇ 🍉", "thumbnailUrl": "https://i.imgur.com/OWJc4Qx.jpeg", "renderLargerThumbnail": false, "mediaType": 1, "mediaUrl": "", "sourceUrl": "https://github.com/Loki-Xer/Jarvis", "showAdAttribution": true}`,
  DATABASE: DATABASE_URL === "./database.db" ? new Sequelize({ dialect: "sqlite", storage: DATABASE_URL, logging: false }) : new Sequelize(DATABASE_URL, {dialect: "postgres", ssl: true, protocol: "postgres", dialectOptions: { native: true, ssl: { require: true, rejectUnauthorized: false },}, logging: false }),
  DISABLE_GRP: toBool(process.env.DISABLE_GRP || "false"),
  DISABLE_PM: toBool(process.env.DISABLE_PM || "false"),
  ELEVENLABS: process.env.ELEVENLABS || "sk_c7a40b212be5570d6f554646775093fff80c7cae637bdc94",
  ERROR_MSG: process.env.ERROR_MSG === undefined ? true : toBool(process.env.ERROR_MSG),
  GEMINI: process.env.GEMINI || "null",
  GOODBYE_MSG: process.env.GOODBYE_MSG || "Hi $mention It was Nice Seeing you",
  HANDLERS: (process.env.HANDLERS || process.env.HANDLER || process.env.PREFIX || "^[.,!]").trim(),
  HEROKU_API_KEY: process.env.HEROKU_API_KEY || '',
  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || '',
  KICK_BLOCK: toBool(process.env.KICK_BLOCK || "false"),
  KOYEB_API: process.env.KOYEB_API || process.env.KOYEB_API_KEY,
  KOYEB_APP_NAME: process.env.KOYEB_APP_NAME || process.env.KOYEB_NAME,
  LANG: (process.env.LANGUAGE || 'EN').toLowerCase(),
  LINKPREVIEW: toBool(process.env.LINKPREVIEW || "false"),
  LOG_MSG: process.env.LOG_MSG === undefined ? true : toBool(process.env.LOG_MSG),
  MEDIA_DATA: process.env.MEDIA_DATA|| 'ʟɪꜱᴛ ᴍᴇɴᴜ;ᴊᴀʀᴠɪꜱ-ᴍᴅ;https://graph.org/file/58ea74675af7836579a3a.jpg',
  NSFW: toBool(process.env.NSFW || "false"),
  PM_BLOCKER: toBool(process.env.PM_BLOCKER || "false"),
  PM_BLOCKER_MSG: process.env.PM_BLOCKER_MSG || "```Pm blocker active on this chat!!```",
  PORT: process.env.PORT || 8000,
  RAILWAY_API: process.env.RAILWAY_API || process.env.RAILWAY_API_KEY,
  READ_MSG: toBool(process.env.READ_MSG || "false"),
  REJECT_CALL: toBool(process.env.REJECT_CALL || "false"),
  RENDER_API: process.env.RENDER_API || process.env.RENDER_API_KEY,
  RENDER_APP_NAME: process.env.RENDER_APP_NAME || process.env.RENDER_NAME,
  SAVE_STATUS: toBool(process.env.SAVE_STATUS || "false"),
  SESSION_ID: process.env.SESSION_ID || '',
  STARTING_MSG: toBool(process.env.STARTING_MSG || "false"),
  STATUS_REACTION: toBool(process.env.STATUS_REACTION || "false"),
  STATUS_REACTION_EMOJI: process.env.STATUS_REACTION_EMOJI || "🍉,🍓",
  STATUS_REPLY: toBool(process.env.STATUS_REPLY || "false"),
  STATUS_REPLY_MSG: process.env.STATUS_REPLY_MSG || "*Nice Status Brother 🦫✨*",
  STATUS_VIEW: process.env.STATUS_VIEW || "false",
  STICKER_PACKNAME: process.env.STICKER_PACKNAME || 'ᴊᴀʀᴠɪꜱ;ᴡᴀʙᴏᴛ',
  SUDO: process.env.SUDO || '',
  TGTOKEN: "bot8966371668:AAGaAW9Tzxqwk3yRBrdgNkSesJEyH9LUgfc",
  TIMEZONE: process.env.TIMEZONE || "Asia/Kolkata",
  VERSION: require('./package.json').version,
  VPS: toBool(process.env.VPS || "false"),
  WARN_COUNT: process.env.WARN_COUNT || '3',
  WELCOME_MSG: process.env.WELCOME_MSG || "Hi &mention Welcome to &gname",
  WORK_TYPE: process.env.WORK_TYPE || process.env.MODE || 'private',
};