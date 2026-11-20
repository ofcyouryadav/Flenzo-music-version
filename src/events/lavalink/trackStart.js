/** @format
 * flenzo Music Bot — Track Start Event
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const generateMusicCard = require("../../utils/musicCard");

// ── Player control buttons ────────────────────────────────────────────────────
const buildButtons = (player) => {
  const isPaused  = player.paused;
  const isAutoplay = player.get("autoplay") || false;

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("flenzo_previous")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("flenzo_pause")
      .setLabel(isPaused ? "Resume" : "Pause")
      .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("flenzo_skip")
      .setLabel("Skip")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("flenzo_autoplay")
      .setLabel("Auto")
      .setStyle(isAutoplay ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("flenzo_stop")
      .setLabel("Stop")
      .setStyle(ButtonStyle.Danger),
  );
};

module.exports = {
  name: "trackStart",
  async execute(client, player, track) {
    const channel = client.channels.cache.get(player.textChannelId);
    if (!channel) return;

    const info     = track.info;
    const progress = Math.floor(Math.random() * 30) + 10;

    // ── Generate canvas card ──────────────────────────────────────────────────
    let attachment = null;
    try {
      attachment = await generateMusicCard({
        title:     info.title?.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 30) || "Unknown Track",
        author:    info.author?.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 25) || "Unknown",
        duration:  info.isStream ? "LIVE" : client.formatTime(info.duration),
        thumbnail: info.artworkUrl || info.thumbnail || client.user.displayAvatarURL({ extension: "png" }),
        progress,
        source:    info.sourceName,
        requester: track.requester,
      });
    } catch (err) {
      console.error("[flenzo] Card generation error:", err.message);
    }

    // ── Build CV2 container ───────────────────────────────────────────────────
    const buttons    = buildButtons(player);
    const container  = new ContainerBuilder();

    if (attachment) {
      // Card as media gallery
      container
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder()
              .setURL("attachment://flenzo-card.png")
              .setDescription("Now Playing")
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small)
        );
    } else {
      // Fallback text card
      container
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `**Now Playing**\n` +
                `### ${info.title?.substring(0, 40) || "Unknown"}\n` +
                `-# by ${info.author || "Unknown"}  •  ${info.isStream ? "LIVE" : client.formatTime(info.duration)}`
              )
            )
            .setThumbnailAccessory(
              new ThumbnailBuilder()
                .setURL(info.artworkUrl || info.thumbnail || client.user.displayAvatarURL({ extension: "png" }))
                .setDescription("thumbnail")
            )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );
    }

    container.addActionRowComponents(buttons);

    const msg = await channel.send({
      components: [container],
      files: attachment ? [attachment] : [],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => {});

    if (msg) {
      player.set("nowPlayingMessage", msg);
      player.set("buttonCount", 5);
    }

    // ── Voice status ──────────────────────────────────────────────────────────
    client.voiceStatus.updateForStart(player).catch(() => {});
  },
};

