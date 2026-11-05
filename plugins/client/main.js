const { getBuffer, getJson, postJson } = require("jarvis-md");
const id3 = require("browser-id3-writer");
const fs = require('fs');
const path = require('path');

function removeFiles(directoryPath) {
  const extensions = new Set([
    '.mp4', '.gif',  '.webp', '.jpg',  '.jpeg',
    '.png', '.mp3',  '.wav',  '.bin',  '.opus'
  ]);

  let deletedCount = 0;
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (extensions.has(ext)) {
      const filePath = path.join(directoryPath, file);
      fs.unlinkSync(filePath);
      console.log('File deleted:', filePath);
      deletedCount++;
    }
  }

  return deletedCount;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

async function extractUrlsFromText(text) {
    if (!text) return false;
    const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi;
    let urls = text.match(regexp);
    return urls || [];
};

module.exports = {
  sleep,  
  getJson, 
  getBuffer,
  postJson,
  removeFiles, 
  extractUrlsFromText,
  AddMp3Meta: async (songbuffer, coverBuffer, options = {}) => {
    if (!Buffer.isBuffer(songbuffer)) {
      songbuffer = await getBuffer(songbuffer);
    };
    if (!Buffer.isBuffer(coverBuffer)) {
      coverBuffer = await getBuffer(coverBuffer);
    };
    const writer = new id3(songbuffer);
    writer.setFrame("TIT2", options.title || "jarvis").setFrame("TPE1", options.body ? [options.body] : ["Jarvis"]).setFrame("APIC", {
      type: 3,
      data: coverBuffer,
      description: "powered by loki",
    });
    writer.addTag();
    return Buffer.from(writer.arrayBuffer);
  },
  IronMan: function IronMan(endpoint) { 
      return `https://ironman.koyeb.app/${endpoint}`; 
  },
  LokiXer: function LokiXer(endpoint) { 
      return `https://lokixer.onrender.com/${endpoint}`; 
  },
  isUrl: (isUrl = (url) => {
    return new RegExp(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
      "gi"
    ).test(url);
  })
};
