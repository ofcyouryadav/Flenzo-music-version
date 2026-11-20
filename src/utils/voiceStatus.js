/** @format
 * flenzo Music Bot — Voice Status Manager
 * Developer: Yadav
 */

const axios = require("axios");

const SOURCE_ICONS = {
  spotify: "<a:karma_spotify:1484876600586666085>",
  youtube: "<:FakeNitroEmoji:1484874383620309193>",
  youtubemusic: "<:FakeNitroEmoji:1484874383620309193>",
  soundcloud: "<:SoundCloud:1484874343438618675>",
  applemusic: "<:applemusic:1484874995388649482>",
  deezer: "<:deezer:1484874520727916676>",
  jiosaavn: "<:JioSaavn:1484875128138498199>",
  http: "🎙️",
};

const IDLE_STATUSES_247 = [
  "Waiting for someone to drop a banger...",
  "24/7 Mode — Always here, always ready",
  "Queue is empty... drop a song!",
  "flenzo Bot — Music that never stops",
  "Idle but never sleeping — play something!",
  "Silence is temporary, music is forever",
  "The stage is empty... for now",
  "Riding the waves, waiting for the beat",
  "Ready to play your next favourite track",
  "Powered by flenzo — by Yadav",
];

class VoiceStatusManager {
  constructor(client) {
    this.client = client;
    this.cache = new Map();
    this.lastUpdate = new Map();
    this.pending = new Map();
    this.rateLimits = new Map();
    this.idleRotators = new Map();
    this.updateInterval = 1000;
    this.debounceDelay = 1500;
    this.maxRetries = 3;
  }

  getIcon(sourceName) {
    const key = (sourceName || "").toLowerCase().replace(/\s|-/g, "");
    return SOURCE_ICONS[key] || "<:karma_music:1484878900155908228>";
  }

  async _send(channelId, status) {
    if (!channelId || !status) return false;
    const rl = this.rateLimits.get(channelId);
    if (rl && Date.now() < rl) return false;
    if (this.cache.get(channelId) === status) return true;
    const last = this.lastUpdate.get(channelId) || 0;
    if (Date.now() - last < this.updateInterval) return false;
    const truncated = status.length > 300 ? status.slice(0, 297) + "..." : status;
    for (let i = 1; i <= this.maxRetries; i++) {
      try {
        await axios.put(
          `https://discord.com/api/v10/channels/${channelId}/voice-status`,
          { status: truncated },
          { headers: { Authorization: `Bot ${this.client.token}`, "Content-Type": "application/json" }, timeout: 8000 }
        );
        this.cache.set(channelId, truncated);
        this.lastUpdate.set(channelId, Date.now());
        this.rateLimits.delete(channelId);
        return true;
      } catch (err) {
        if (err.response?.status === 429) {
          this.rateLimits.set(channelId, Date.now() + (err.response.data?.retry_after || 60) * 1000);
          return false;
        }
        if (err.response?.status === 404) {
          this.cache.delete(channelId);
          return false;
        }
        if (i < this.maxRetries) await new Promise(r => setTimeout(r, i * 500));
      }
    }
    return false;
  }

  async set(channelId, status, force = false) {
    if (!channelId || !status) return false;
    if (force) {
      const p = this.pending.get(channelId);
      if (p) { clearTimeout(p); this.pending.delete(channelId); }
      return await this._send(channelId, status);
    }
    const ex = this.pending.get(channelId);
    if (ex) clearTimeout(ex);
    return new Promise(resolve => {
      const t = setTimeout(async () => {
        resolve(await this._send(channelId, status));
        this.pending.delete(channelId);
      }, this.debounceDelay);
      this.pending.set(channelId, t);
    });
  }

  async clear(channelId) {
    if (!channelId) return false;
    this.stopIdleRotator(channelId);
    this.cache.delete(channelId);
    this.lastUpdate.delete(channelId);
    const p = this.pending.get(channelId);
    if (p) { clearTimeout(p); this.pending.delete(channelId); }
    // ✅ Fixed: cleaner status message
    return await this.set(channelId, `Use .play <song> to start playing`, true);
  }

  startIdleRotator(channelId) {
    if (this.idleRotators.has(channelId)) return;
    let i = 0;
    this._send(channelId, IDLE_STATUSES_247[i]);
    const interval = setInterval(async () => {
      if (!this.idleRotators.has(channelId)) { clearInterval(interval); return; }
      i = (i + 1) % IDLE_STATUSES_247.length;
      await this._send(channelId, IDLE_STATUSES_247[i]);
    }, 30_000);
    this.idleRotators.set(channelId, interval);
  }

  stopIdleRotator(channelId) {
    const r = this.idleRotators.get(channelId);
    if (r) { clearInterval(r); this.idleRotators.delete(channelId); }
  }

  async updateForStart(player) {
    const track = player.queue.current;
    if (!track || !player.voiceChannelId) return false;
    this.stopIdleRotator(player.voiceChannelId);
    const icon = this.getIcon(track.info?.sourceName);
    const title = (track.info?.title || "Unknown").slice(0, 180);
    const author = (track.info?.author || "Unknown").slice(0, 60);
    const status = player.paused
      ? `${icon} ⏸ Paused: ${title}`
      : `${icon} ${title} — ${author}`;
    return await this.set(player.voiceChannelId, status, false);
  }

  // ✅ Fixed: channelId ko pehle cache karo, destroy ke baad null ho jaata hai
  async updateForEnd(player) {
    const channelId = player.voiceChannelId;
    if (!channelId) return false;
    this.stopIdleRotator(channelId);
    return await this.clear(channelId);
  }

  async updateForEmpty(player, is247 = false, isAutoplay = false) {
    if (!player.voiceChannelId) return false;
    if (isAutoplay) {
      this.stopIdleRotator(player.voiceChannelId);
      return await this.set(player.voiceChannelId, "♬ Fetching related songs…", true);
    }
    if (is247) {
      this.startIdleRotator(player.voiceChannelId);
      return true;
    }
    this.stopIdleRotator(player.voiceChannelId);
    // ✅ Fixed: same cleaner status
    return await this.set(player.voiceChannelId, `Use .play <song> to start playing`, true);
  }

  async updateForPause(player, isPaused) {
    const track = player.queue.current;
    if (!track || !player.voiceChannelId) return false;
    const icon = this.getIcon(track.info?.sourceName);
    const title = (track.info?.title || "Unknown").slice(0, 150);
    const author = (track.info?.author || "").slice(0, 60);
    const status = isPaused
      ? `${icon} ⏸ Paused: ${title}`
      : `${icon} ▶ ${title} — ${author}`;
    return await this.set(player.voiceChannelId, status, true);
  }

  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [id, rt] of this.rateLimits.entries()) if (now > rt) this.rateLimits.delete(id);
      // ✅ Fixed: broken line join
      for (const [id, lu] of this.lastUpdate.entries()) if (now - lu > 3600000) { this.cache.delete(id); this.lastUpdate.delete(id); }
    }, 300_000);
  }
}

module.exports = VoiceStatusManager;