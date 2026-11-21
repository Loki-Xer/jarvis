let mod = global.Baileys || null;
let versionPromise = null;

async function load() {
  if (mod) return mod;
  mod = await import("@whiskeysockets/baileys");
  global.Baileys = mod;
  return mod;
}

function getModule() {
  if (!mod) {
    mod = global.Baileys || null;
  }

  if (!mod) {
    throw new Error(
      "Baileys has not been loaded yet. Start the application through index.js first."
    );
  }

  return mod;
}

function fetchLatestBaileysVersion() {
  if (!versionPromise) {
    versionPromise = (async () => {
      if (process.env.WA_VERSION) {
        const parts = process.env.WA_VERSION.split(/[.,]/).map(Number);
        if (parts.length === 3 && parts.every(Number.isFinite)) {
          return { version: parts, isLatest: false };
        }
      }
      let timer;
      try {
        const latest = await Promise.race([
          getModule().fetchLatestBaileysVersion(),
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error("timeout")), 5000);
          }),
        ]);
        if (Array.isArray(latest?.version)) {
          return { version: latest.version, isLatest: latest.isLatest ?? true };
        }
      } catch (_) {
      } finally {
        clearTimeout(timer);
      }
      versionPromise = null;
      return { version: undefined, isLatest: false };
    })();
  }
  return versionPromise;
}

module.exports = new Proxy({}, {
  get(_, prop) {
    if (prop === "load") return load;
    if (prop === "fetchLatestBaileysVersion") return fetchLatestBaileysVersion;
    if (prop === "default") return getModule().default;
    return getModule()[prop];
  },

  has(_, prop) {
    if (prop === "load" || prop === "fetchLatestBaileysVersion") return true;
    return prop in getModule();
  },

  ownKeys() {
    const keys = new Set(Reflect.ownKeys(getModule()));
    keys.add("fetchLatestBaileysVersion");
    return [...keys];
  },

  getOwnPropertyDescriptor(_, prop) {
    const value =
      prop === "fetchLatestBaileysVersion"
        ? fetchLatestBaileysVersion
        : getModule()[prop];
    if (value === undefined) return undefined;

    return {
      enumerable: true,
      configurable: true,
      value
    };
  }
});
