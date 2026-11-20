/** @format
 * flenzo Music Bot — Grab Command (Premium)
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
const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "grab",
  aliases: ["save", "dm"],
  description: "DM yourself the current song info",
  category: "music",
  usage: "",
  cooldown: 10,
  premium: true,
  ownerOnly: false,
  inVoice: false,
  sameVoice: false,
  needPlayer: true,

  async execute(client, message) {
    const player = client.lavalink.getPlayer(message.guild.id);
    const track = player.queue.current;
    const info = track.info;
    const link = info?.uri?.startsWith("http") ? info.uri : client.support;

    const container = new ContainerBuilder()
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Grabbed from flenzo Music!**\n` +
              `### [${info.title?.replace(/[\[\]]/g, "")}](${link})\n` +
              `-# by ${info.author}  •  ${info.isStream ? "LIVE" : client.formatTime(info.duration)}`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder()
              .setURL(info.artworkUrl || info.thumbnail || client.user.displayAvatarURL({ extension: "png" }))
              .setDescription("thumbnail")
          )
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `> **Source:** \`${info.sourceName || "Unknown"}\`\n` +
          `> **Grabbed at:** <t:${Math.floor(Date.now() / 1000)}:F>\n` +
          `> **From server:** ${message.guild.name}`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# flenzo Music — by Yadav  •  [Support](${client.support})`)
      );

    const dm = await message.author.createDM().catch(() => null);
    if (!dm)
      return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Could not send DM. Please enable DMs from server members.**`)).catch(() => { });

    await dm.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => { });

    return message.reply(cv2(`<a:karma_TICK:1484879254306164826> **Song info sent to your DMs!**`)).catch(() => { });
  },
};

