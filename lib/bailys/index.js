let mod = global.Baileys || null;

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

module.exports = new Proxy({}, {
  get(_, prop) {
    if (prop === "load") return load;
    if (prop === "default") return getModule().default;
    return getModule()[prop];
  },

  has(_, prop) {
    return prop in getModule();
  },

  ownKeys() {
    return Reflect.ownKeys(getModule());
  },

  getOwnPropertyDescriptor(_, prop) {
    const value = getModule()[prop];
    if (value === undefined) return undefined;

    return {
      enumerable: true,
      configurable: true,
      value
    };
  }
});
