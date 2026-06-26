/** @format
 * flenzo Music Bot
 * Developer: Yadav
 */

require("dotenv").config();
const emoji = require("./emoji");

module.exports = {
  // ── Bot ───────────────────────────────────────────────────────────────────
  token:    process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  prefix:   ".",
  color:    "#5865F2",

  // ── Links ─────────────────────────────────────────────────────────────────
  support: "https://discord.gg/5AcWcaFSK6",
  invite:  `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`,

  // ── Database ──────────────────────────────────────────────────────────────
  mongoUri: process.env.MONGO_URI,

  // ── Lavalink ──────────────────────────────────────────────────────────────
  lavalink: {
    nodes: [
      {
        id:            "main",
        host:          process.env.LAVALINK_HOST || "localhost",
        port:          Number(process.env.LAVALINK_PORT) || 2333,
        authorization: process.env.LAVALINK_PASSWORD || "youshallnotpass",
        secure:        false,
      },
    ],
  },

  // ── Developer / Owners ────────────────────────────────────────────────────
  owners: ["867420007558021141","1363724949939814423"],

  // ── Emojis ────────────────────────────────────────────────────────────────
  emojis: {
    yes:    emoji.custom_yes,
    no:     emoji.custom_no,
    warn:   emoji.custom_warn,
    bell:   emoji.custom_bell,
    music:  emoji.custom_music,
    search: emoji.custom_search,
    on:     emoji.custom_on,
    off:    emoji.custom_off,
    crown:  emoji.crown,
    lock:   emoji.lock,
  },
};

