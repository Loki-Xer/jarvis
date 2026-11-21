const backup = new Map();

function cmdName(cmd) {
  if (!cmd.pattern) return "";
  const m = cmd.pattern.source.match(/\(\s*([a-z0-9_]+)/i);
  return m ? m[1].toLowerCase() : "";
};

async function getToggleList() {
  try {
    const { getData } = require("../../lib/database/");
    const data = await getData("toggle");
    const list = data && data.toggle && data.toggle.message;
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
};

async function setToggleList(list) {
  const { setData } = require("../../lib/database/");
  return await setData("toggle", list, "true", "toggle");
};

function removeDuplicateCmd(name) {
  const { commands } = require("../../lib/system");
  const same = commands.filter((c) => !c.on && cmdName(c) === name);
  if (!same.length) return 0;
  const old = same.length > 1 ? same.slice(1) : same;
  for (const cmd of old) {
    const i = commands.indexOf(cmd);
    if (i !== -1) commands.splice(i, 1);
  }
  backup.set(name, old);
  return old.length;
};

function restoreCmd(name) {
  const { commands } = require("../../lib/system");
  const old = backup.get(name);
  if (!old) return false;
  commands.push(...old);
  backup.delete(name);
  return true;
};

async function applyToggle() {
  let removed = 0;
  for (const name of await getToggleList()) removed += removeDuplicateCmd(name);
  return removed;
};

module.exports = {
  getToggleList,
  setToggleList,
  removeDuplicateCmd,
  restoreCmd,
  applyToggle
};