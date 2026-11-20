/** @format
 * flenzo Music Bot — Queue Command
 * Developer: Yadav
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "queue",
  aliases: ["q"],
  description: "Show the current queue",
  category: "music",
  usage: "[page]",
  cooldown: 3,
  premium: false,
  ownerOnly: false,
  inVoice: false,
  sameVoice: false,
  needPlayer: true,

  async execute(client, message, args) {
    const player = client.lavalink.getPlayer(message.guild.id);
    const tracks = player.queue.tracks;
    const current = player.queue.current;
    const PAGE = 10;
    const total = Math.ceil((tracks.length || 1) / PAGE);
    let page = Math.max(1, Math.min(parseInt(args[0]) || 1, total));

    const buildContainer = (pg) => {
      const start = (pg - 1) * PAGE;
      const slice = tracks.slice(start, start + PAGE);

      const trackList = slice.length
        ? slice.map((t, i) => {
          const link = t.info?.uri?.startsWith("http") ? t.info.uri : client.support;
          return `\`${start + i + 1}.\` [${t.info.title.replace(/[\[\]]/g, "").substring(0, 35)}](${link}) — \`${client.formatTime(t.info.duration)}\``;
        }).join("\n")
        : "-# Queue is empty";

      const currentLink = current?.info?.uri?.startsWith("http") ? current.info.uri : client.support;

      return new ContainerBuilder()
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `**Queue** — \`${tracks.length} tracks\`\n` +
                `-# Page ${pg}/${total}  •  Volume: ${player.volume}%`
              )
            )
            .setThumbnailAccessory(
              new ThumbnailBuilder()
                .setURL(current?.info?.artworkUrl || client.user.displayAvatarURL({ extension: "png" }))
                .setDescription("now playing")
            )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Now Playing:**\n[${current?.info?.title?.replace(/[\[\]]/g, "").substring(0, 40) || "Unknown"}](${currentLink})  •  \`${current?.info?.isStream ? "LIVE" : client.formatTime(current?.info?.duration)}\``
          )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Up Next:**\n${trackList}`)
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# Loop: \`${player.repeatMode || "off"}\`  • Autoplay: \`${player.get("autoplay") ? "on" : "off"}\``
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`q_prev_${pg}`).setLabel("Previous").setStyle(ButtonStyle.Secondary).setDisabled(pg <= 1),
            new ButtonBuilder().setCustomId(`q_next_${pg}`).setLabel("Next").setStyle(ButtonStyle.Secondary).setDisabled(pg >= total),
            new ButtonBuilder().setCustomId("q_close").setLabel("Close").setStyle(ButtonStyle.Danger)
          )
        );
    };

    const m = await message.reply({
      components: [buildContainer(page)],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => { });

    if (!m) return;

    const collector = m.createMessageComponentCollector({
      filter: (i) => {
        if (i.user.id !== message.author.id) {
          i.reply({ content: "<a:karma_wrong_time:1484885465944559616> Not your menu.", ephemeral: true }).catch(() => { });
          return false;
        }
        return true;
      },
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "q_close") {
        collector.stop();
        return i.update({
          components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("Queue closed."))],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] },
        });
      }
      if (i.customId.startsWith("q_prev_")) page = Math.max(1, page - 1);
      if (i.customId.startsWith("q_next_")) page = Math.min(total, page + 1);
      await i.update({
        components: [buildContainer(page)],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      }).catch(() => { });
    });

    collector.on("end", async (_, reason) => {
      if (reason === "time") m.edit({ components: [] }).catch(() => { });
    });
  },
};

