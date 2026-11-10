const config = require("../config");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isEval = (code) => /\beval\s*\(|\bnew\s+Function\s*\(|\bFunction\s*\(|\bvm\.runIn(?:This|New)Context\s*\(|\bvm\.Script\s*\(/.test(code);

const NULL_HANDLER = "^.?";
const handlerSource = (!config.HANDLERS || ["null", "false"].includes(config.HANDLERS)) ? "^.?" : (config.HANDLERS.startsWith("^[") && config.HANDLERS.endsWith("]") ? config.HANDLERS : "^[" + config.HANDLERS + "]");
const HANDLER = handlerSource;
const PREFIX = HANDLER.startsWith("^") ? HANDLER : HANDLER.replace(/[\[\].]/g, "\\$&");

config.BASE_URL = "https://lokiser.vercel.app/";
config.HANDLERS = PREFIX;
let commands = [];

function System(info, func) {
  if (info.nsfw && !config.NSFW) return;

  if (!info.on && !info.pattern) {
    info.on = "message";
    info.fromMe = false;
  } else if (info.on && info.pattern) {
    const flags = info.flags ? info.flags + "u" : "u";
    info.pattern = new RegExp(
      (info.handler ?? true ? PREFIX : "") + info.pattern,
      flags
    );
  } else {
    info.pattern = new RegExp(
      (PREFIX.startsWith("^") ? PREFIX : "^.+" + PREFIX) +
        "(" + info.pattern + "| " + info.pattern + ")",
      "isu"
    );
  }

  commands.push({
    ...info,
    function: func,
    usesEval: isEval(func.toString()),
  });
  return info;
}

const prefix = (PREFIX.match(/\[\W*]/)?.[0]?.[1] || "").trim();

module.exports = {
  commands,
  System,
  sleep,
  prefix,
  isPrivate: config.WORK_TYPE.toLowerCase().includes("private"),
  config,
};