/** @format
 * flenzo Music Bot — Now Playing Command (Premium)
 * Developer: Yadav
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const generateMusicCard = require("../../utils/musicCard");
const emoji = require("../../emoji");

module.exports = {
  name: "nowplaying",
  aliases: ["np", "now"],
  description: "Show the currently playing song with card",
  category: "music",
  usage: "",
  cooldown: 5,
  premium: true,
  ownerOnly: false,
  inVoice: false,
  sameVoice: false,
  needPlayer: true,

  async execute(client, message) {
    const player = client.lavalink.getPlayer(message.guild.id);
    const track = player.queue.current;
    const info = track.info;
    const pos = player.position || 0;
    const dur = info.duration || 1;
    const progress = Math.floor((pos / dur) * 100);

    let attachment = null;
    try {
      attachment = await generateMusicCard({
        title: info.title?.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 30) || "Unknown",
        author: info.author?.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 25) || "Unknown",
        duration: info.isStream ? "LIVE" : client.formatTime(info.duration),
        thumbnail: info.artworkUrl || info.thumbnail || client.user.displayAvatarURL({ extension: "png" }),
        progress,
        source: info.sourceName,
        requester: track.requester,
      });
    } catch { }

    const container = new ContainerBuilder();
    if (attachment) {
      const { MediaGalleryBuilder, MediaGalleryItemBuilder } = require("discord.js");
      container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL("attachment://flenzo-card.png").setDescription("Now Playing")
        )
      );
    } else {
      container.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**${emoji.music} Now Playing**\n### ${info.title?.substring(0, 40)}\n-# ${info.author}  •  ${client.formatTime(pos)} / ${client.formatTime(dur)}`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder()
              .setURL(info.artworkUrl || client.user.displayAvatarURL({ extension: "png" }))
              .setDescription("thumbnail")
          )
      );
    }

    container
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `> ${emoji.loop} Loop: \`${player.repeatMode || "off"}\`  •  ${emoji.volume} Vol: \`${player.volume}%\`  •  ${emoji.autoplay} Auto: \`${player.get("autoplay") ? "on" : "off"}\``
        )
      );

    await message.reply({
      components: [container],
      files: attachment ? [attachment] : [],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => { });
  },
};

