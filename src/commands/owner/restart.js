const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require("discord.js");

const Guild = require("../../database/schemas/Guild");

module.exports = {
  name: "restart",
  aliases: ["reboot", "rs"],
  description: "Restart the bot",
  category: "owner",
  cooldown: 0,
  premium: false,
  ownerOnly: true,

  async execute(client, message) {
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Restarting flenzo...**`))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `> **Uptime was:** \`${h}h ${m}m ${s}s\`\n` +
        `> **Active players:** \`${client.lavalink?.players?.size ?? 0}\`\n` +
        `-# Are you sure you want to restart?`
      ));

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("restart_yes")
        .setLabel("Yes")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("restart_no")
        .setLabel("No")
        .setEmoji("❌")
        .setStyle(ButtonStyle.Danger),
    );

    const reply = await message.reply({
      components: [container, row],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => null);

    if (!reply) return;

    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 30_000,
      max: 1,
    });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate().catch(() => {});

      if (interaction.customId === "restart_no") {
        const cancelContainer = new ContainerBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Restart Cancelled**`))
          .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `-# No changes were made.`
          ));

        await reply.edit({
          components: [cancelContainer],
          flags: MessageFlags.IsComponentsV2,
        }).catch(() => {});
        return;
      }

      // Yes — proceed with restart
      const confirmContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Restarting flenzo...**`))
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
          `> **Uptime was:** \`${h}h ${m}m ${s}s\`\n` +
          `> **Active players:** \`${client.lavalink?.players?.size ?? 0}\`\n` +
          `-# Bot will be back in a few seconds...`
        ));

      await reply.edit({
        components: [confirmContainer],
        flags: MessageFlags.IsComponentsV2,
      }).catch(() => {});

      // ✅ 247 wale players ko destroy mat karo
      try {
        for (const [guildId, player] of client.lavalink.players) {
          const is247 = await Guild.findOne({ guildId, is247: true }).catch(() => null);
          if (is247) continue;
          await player.destroy().catch(() => {});
        }
      } catch {}

      setTimeout(() => process.exit(0), 1500);
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        const timeoutRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("restart_yes")
            .setLabel("Yes")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("restart_no")
            .setLabel("No")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true),
        );

        const timeoutContainer = new ContainerBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Restart Cancelled**`))
          .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `-# Timed out — no response received.`
          ));

        await reply.edit({
          components: [timeoutContainer, timeoutRow],
          flags: MessageFlags.IsComponentsV2,
        }).catch(() => {});
      }
    });
  },
};