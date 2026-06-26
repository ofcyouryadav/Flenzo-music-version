/** @format
 * flenzo Music Bot
 * Developer: Yadav
 */

const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const { LavalinkManager } = require("lavalink-client");
const mongoose = require("mongoose");
const config   = require("../config");
const VoiceStatusManager = require("../utils/voiceStatus");

class flenzoClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
      allowedMentions: { parse: [], repliedUser: false },
    });

    // ── Collections ───────────────────────────────────────────────────────────
    this.commands      = new Collection();
    this.slashCommands = new Collection();
    this.cooldowns     = new Collection();

    // ── Config ────────────────────────────────────────────────────────────────
    this.config  = config;
    this.prefix  = config.prefix;
    this.owners  = config.owners;
    this.support = config.support;
    this.color   = config.color;
    this.emoji   = config.emojis;

    // ── Utils ─────────────────────────────────────────────────────────────────
    this.formatTime = require("../utils/formatTime");

    // ── Lavalink ──────────────────────────────────────────────────────────────
    this.lavalink = new LavalinkManager({
      nodes: config.lavalink.nodes,
      sendToShard: (guildId, payload) => {
        const guild = this.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      },
      client: {
        id:       config.clientId || process.env.CLIENT_ID,
        username: "flenzo",
      },
      playerOptions: {
        applyVolumeAsFilter: false,
        clientBasedPositionUpdateInterval: 50,
        defaultSearchPlatform: "spsearch",
        volumeDecrementer: 0.75,
        onDisconnect: {
          autoReconnect: true,
          destroyPlayer: false,
        },
        onEmptyQueue: {
          destroyAfterMs: 30_000,
        },
      },
      advancedOptions: {
        enableDebugEvents: false,
        lavaSearchPlugin:  false,
        lavalinkConfigHost: false,
        supportedEncryptionModes: [
          "aead_aes256_gcm_rtpsize",
          "aead_xchacha20_poly1305_rtpsize",
          "xsalsa20_poly1305_lite_rtpsize",
          "xsalsa20_poly1305_lite",
          "xsalsa20_poly1305_suffix",
          "xsalsa20_poly1305",
        ],
      },
      nodeOptions: {
        supportedEncryptionModes: [
          "aead_aes256_gcm_rtpsize",
          "aead_xchacha20_poly1305_rtpsize",
          "xsalsa20_poly1305_lite_rtpsize",
          "xsalsa20_poly1305_lite",
          "xsalsa20_poly1305_suffix",
          "xsalsa20_poly1305",
        ],
      },
    });

    // ── Voice Status ──────────────────────────────────────────────────────────
    this.voiceStatus = new VoiceStatusManager(this);
  }

  // ── Start ─────────────────────────────────────────────────────────────────
  async start() {
    // Load handlers
    require("../handlers/commandHandler")(this);
    require("../handlers/slashHandler")(this);
    require("../handlers/eventHandler")(this);

    // Start vote webhook server
    require("../events/client/voteHandler").execute(this);

    // Connect MongoDB
    await mongoose
      .connect(this.config.mongoUri)
      .then(() => console.log("[flenzo] ✅ MongoDB connected"))
      .catch((err) => console.error("[flenzo] ❌ MongoDB error:", err));

    // Login
    await this.login(this.config.token);

    // Restore 247 guilds after ready
    this.once("ready", async () => {
      await this._restore247();
    });
  }

  // ── 247 Restore on Restart ────────────────────────────────────────────────
  async _restore247() {
    try {
      await new Promise(r => setTimeout(r, 4000));

      const Guild  = require("../database/schemas/Guild");
      const guilds = await Guild.find({ is247: true, voiceId: { $ne: null } });

      if (!guilds.length) return;
      console.log(`[247] Restoring ${guilds.length} guild(s)...`);

      for (const data of guilds) {
        try {
          const guild = this.guilds.cache.get(data.guildId);
          if (!guild) continue;

          const voiceChannel = guild.channels.cache.get(data.voiceId);
          if (!voiceChannel) continue;

          const existing = this.lavalink.getPlayer(guild.id);
          if (existing?.connected) continue;

          const player = await this.lavalink.createPlayer({
            guildId:        guild.id,
            voiceChannelId: data.voiceId,
            textChannelId:  data.textId || data.voiceId,
            selfDeaf:       true,
            volume:         80,
          });

          if (!player.connected) await player.connect();

          this.voiceStatus?.startIdleRotator(data.voiceId);

          console.log(`[247] ✅ Restored: ${guild.name} → #${voiceChannel.name}`);
        } catch (err) {
          console.error(`[247] ❌ Failed: ${data.guildId} —`, err.message);
        }
      }
    } catch (err) {
      console.error("[247] Restore error:", err.message);
    }
  }

  // ── Helper: is owner ──────────────────────────────────────────────────────
  isOwner(userId) {
    return this.owners.includes(userId);
  }

  // ── Helper: sleep ─────────────────────────────────────────────────────────
  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

module.exports = { flenzoClient };