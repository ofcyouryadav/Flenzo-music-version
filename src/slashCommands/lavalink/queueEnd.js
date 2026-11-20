/** @format
 * flenzo Music Bot — Queue End Event
 * Developer: Yadav
 * Fixed: Autoplay now actually works
 */

const {
  ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder,
  SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, MessageFlags,
} = require("discord.js");
const Guild = require("../../database/schemas/Guild");

// ── Source-aware search for autoplay ──────────────────────────────────────────
async function getAutoplayTrack(player, lastTrack, requester) {
  const info     = lastTrack?.info;
  const source   = info?.sourceName?.toLowerCase() || "";
  const title    = info?.title  || "";
  const author   = info?.author || "";
  const uri      = info?.uri    || "";

  // Already-played URIs to avoid repeats
  const played = new Set(
    (player.queue.previous || []).map(t => t.info?.uri).filter(Boolean)
  );
  played.add(uri);

  const trySearch = async (query, src) => {
    const res = await player.search({ query, source: src }, requester).catch(() => null);
    if (!res?.tracks?.length) return null;
    // Return first unplayed track
    return res.tracks.find(t => !played.has(t.info?.uri)) || res.tracks[0];
  };

  let track = null;

  // 1. YouTube radio (best for autoplay — uses YouTube's recommendation engine)
  if (source === "youtube" && uri.includes("watch?v=")) {
    const videoId = uri.split("watch?v=")[1]?.split("&")[0];
    if (videoId) {
      track = await trySearch(`https://www.youtube.com/watch?v=${videoId}&list=RD${videoId}`, "url");
      if (track) return track;
    }
  }

  // 2. Same source search by author
  if (author) {
    const srcMap = {
      spotify:      "spsearch",
      soundcloud:   "scsearch",
      youtubemusic: "ytmsearch",
      deezer:       "dzsearch",
      applemusic:   "amsearch",
    };
    const srcEngine = srcMap[source] || "spsearch";
    track = await trySearch(`${author} mix`, srcEngine);
    if (track) return track;
  }

  // 3. Title-based search on Spotify
  if (title) {
    track = await trySearch(`${title} ${author}`.trim(), "spsearch");
    if (track) return track;
  }

  // 4. Final fallback — YouTube search
  if (title) {
    track = await trySearch(`${title} ${author}`.trim(), "ytsearch");
    if (track) return track;
  }

  return null;
}

module.exports = {
  name: "queueEnd",
  async execute(client, player) {
    const channel   = client.channels.cache.get(player.textChannelId);
    const guildData = await Guild.findOne({ guildId: player.guildId }).catch(() => null);
    const is247     = guildData?.is247 || false;
    const autoplay  = player.get("autoplay") || false;

    // ── Autoplay ──────────────────────────────────────────────────────────
    if (autoplay) {
      const lastTrack = player.queue.previous?.[0] || player.queue.current;

      client.voiceStatus.updateForEmpty(player, is247, true).catch(() => {});

      try {
        // Find requester — use bot as fallback
        const requester = lastTrack?.requester || client.user;
        const track = await getAutoplayTrack(player, lastTrack, requester);

        if (track) {
          // Mark as autoplay-added
          track.requester = { ...requester, username: `${requester.username || requester.tag} (Auto)` };
          await player.queue.add(track);
          await player.play();
          return; // trackStart will handle the rest
        }
      } catch (err) {
        console.error("[flenzo] Autoplay error:", err.message);
      }

      // Autoplay failed to find a track — fall through to queue end
      client.voiceStatus.updateForEmpty(player, is247, false).catch(() => {});
    }

    // ── Normal queue end ──────────────────────────────────────────────────
    client.voiceStatus.updateForEmpty(player, is247, false).catch(() => {});

    const container = new ContainerBuilder()
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**Queue Finished!**\n` +
            `-# Hope you enjoyed — drop another song to keep vibing!`
          ))
          .setThumbnailAccessory(new ThumbnailBuilder()
            .setURL(client.user.displayAvatarURL({ extension: "png" }))
            .setDescription("flenzo"))
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `-# flenzo Music — by Yadav  •  [Support](${client.support})`
      ))
      .addActionRowComponents(new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("Support").setStyle(ButtonStyle.Link).setURL(client.support),
        new ButtonBuilder().setLabel("Invite flenzo").setStyle(ButtonStyle.Link).setURL(client.config.invite),
      ));

    const msg = await channel?.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => {});

    if (msg) setTimeout(() => msg.delete().catch(() => {}), 15000);

    if (is247) return;

    setTimeout(async () => {
      const p = client.lavalink.getPlayer(player.guildId);
      if (p && !p.playing && !p.paused) await p.destroy().catch(() => {});
    }, 30000);
  },
};

