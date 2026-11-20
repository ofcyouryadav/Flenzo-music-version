/** @format - flenzo — Queue History (Premium) */
const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "history", aliases: ["recent"],
  description: "Show recently played tracks",
  category: "music", cooldown: 5, premium: true,
  inVoice: false, sameVoice: false, needPlayer: true,

  async execute(client, message) {
    const player = client.lavalink.getPlayer(message.guild.id);
    const prev = player.queue.previous || [];

    if (!prev.length)
      return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **No history yet.**`)).catch(() => { });

    const list = prev.slice(0, 15).map((t, i) => {
      const link = t.info?.uri?.startsWith("http") ? t.info.uri : client.support;
      return `> \`${i + 1}.\` [${(t.info.title || "Unknown").replace(/[\[\]]/g, "").substring(0, 35)}](${link}) — \`${client.formatTime(t.info.duration)}\``;
    }).join("\n");

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `**Recently Played — ${prev.slice(0, 15).length} tracks**\n${list}`
      ))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Premium feature  •  flenzo Music by Yadav`));

    return message.reply({
      components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] },
    }).catch(() => { });
  },
};

