const fs = require("fs");
const path = require("path");
const PID_FILE = path.join(__dirname, ".bot.pid");

function killOldInstance() {
  try {
    const oldPid = parseInt(fs.readFileSync(PID_FILE, "utf8"), 10);
    if (oldPid && oldPid !== process.pid) {
      try {
        process.kill(oldPid, 0);
        console.log("Stopping old instance:", oldPid);
        process.kill(oldPid, "SIGTERM");
        setTimeout(() => {
          try { process.kill(oldPid, 0); process.kill(oldPid, "SIGKILL"); } catch {}
        }, 3000);
      } catch {} // not running
    }
  } catch {} // no pid file yet
  try { fs.writeFileSync(PID_FILE, String(process.pid)); } catch {}
}

function cleanupPid() {
  try {
    if (parseInt(fs.readFileSync(PID_FILE, "utf8"), 10) === process.pid) {
      fs.unlinkSync(PID_FILE);
    }
  } catch {}
}

killOldInstance();
process.on("exit", cleanupPid);
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

async function startJarvis() {
  global.Baileys = await import("@whiskeysockets/baileys");

  global.server = require('./config').VPS ? "VPS" : process.env.B4A_URL ? "BACK4APP" : process.env.PWD?.includes("userland") ? "USERLAND" : process.env.PITCHER_API_BASE_URL?.includes("codesandbox") ? "CODESANDBOX" : process.env.REPLIT_USER ? "REPLIT" : process.env.AWS_REGION ? "AWS" : process.env.TERMUX_VERSION ? "TERMUX" : process.env.DYNO ? "HEROKU" : process.env.KOYEB_APP_ID ? "KOYEB" : process.env.GITHUB_SERVER_URL ? "GITHUB" : process.env.RENDER ? "RENDER" : process.env.RAILWAY_SERVICE_NAME ? "RAILWAY" : process.env.VERCEL ? "VERCEL" : process.env.DIGITALOCEAN_APP_NAME ? "DIGITALOCEAN" : process.env.AZURE_HTTP_FUNCTIONS ? "AZURE" : process.env.NETLIFY ? "NETLIFY" : process.env.FLY_IO ? "FLY_IO" : process.env.CLOUDFLARE_API_TOKEN ? "CLOUDFLARE" : process.env.SPACE_ID ? "HUGGINGFACE" : require("os").platform().toUpperCase();

  process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason?.stack || reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('[uncaughtException]', err?.stack || err);
  });

  const http = require('http');
  const axios = require('axios');
  const PORT = typeof process.env.PORT === "string" && !Number.isNaN(Number(process.env.PORT)) ? Number(process.env.PORT) : Math.floor(Math.random() * (9999 - 3000 + 1)) + 3000;
  const { Jarvis } = require("./lib/Base/");
  const { removeFiles } = require("./plugins/client/");
  const url = global.server === "BACK4APP" ? process.env.B4A_URL : global.server === "RENDER" ? process.env.RENDER_EXTERNAL_URL : global.server === "KOYEB" ? "https://" + process.env.KOYEB_PUBLIC_DOMAIN : false;

  if (global.server === "BACK4APP") {
    process.env.NODE_OPTIONS = '--max-old-space-size=200';
  } else {
    process.env.NODE_OPTIONS = `--max-old-space-size=${Math.floor((require('os').totalmem() / (1024 * 1024)) * 0.6)}`;
  }

  http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server is Running!');
  }).listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} as ${global.server}`);
  });

  setInterval(() => {
    removeFiles("./");
    removeFiles("./lib/temp");
    if (url) {
      axios.get(url, {
        timeout: 5000,
        headers: { 'User-Agent': 'Uptime-Bot' },
        validateStatus: s => s < 500
      }).then(r =>
        console.log(`[${new Date().toISOString()}] Keep-alive Ping to ${url} - Status: ${r.status}`)
      ).catch(e =>
        console.log(`[${new Date().toISOString()}] Ping Failed! ${e.message}`)
      );
    }
  }, 5 * 60 * 1000);

  await new Promise(r => setTimeout(r, 3000));
  Jarvis({ isStarted: true });
}

startJarvis().catch((error) => {
  console.error("[Jarvis startup error]", error?.stack || error);
  process.exit(1);
});
