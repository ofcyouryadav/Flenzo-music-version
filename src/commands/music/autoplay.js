/** @format
 * flenzo Music Bot — Autoplay Command
 * Developer: Yadav
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const { cv2 } = require("../../utils/cv2");
const emoji = require("../../emoji");

module.exports = {
  name: "autoplay",
  aliases: ["ap"],
  description: "Toggle autoplay mode",
  category: "music",
  usage: "",
  cooldown: 3,
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: true,

  async execute(client, message) {
    const player  = client.lavalink.getPlayer(message.guild.id);
    const current = player.get("autoplay") || false;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("flenzo_ap_enable")
        .setLabel("Enable")
        .setStyle(ButtonStyle.Success)
        .setDisabled(current),
      new ButtonBuilder()
        .setCustomId("flenzo_ap_disable")
        .setLabel("Disable")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(!current),
    );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${emoji.loop} **Autoplay** — Currently \`${current ? "Enabled" : "Disabled"}\`\n` +
          `-# When queue ends, bot will auto-queue related songs`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small))
      .addActionRowComponents(row);

    const m = await message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => {});

    if (!m) return;

    const collector = m.createMessageComponentCollector({
      filter: (i) => {
        if (i.user.id !== message.author.id) {
          i.reply({ content: `${emoji.error} Not your menu.`, ephemeral: true }).catch(() => {});
          return false;
        }
        return true;
      },
      time: 30000,
      idle: 15000,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();
      const enabling = interaction.customId === "flenzo_ap_enable";
      player.set("autoplay", enabling);
      m.edit(cv2(
        `${enabling ? emoji.enabled : emoji.disabled} **Autoplay ${enabling ? "Enabled" : "Disabled"}!**\n` +
        `-# Set by ${message.author.tag}`
      )).catch(() => {});
      collector.stop();
    });

    collector.on("end", (col) => {
      if (!col.size) m.edit(cv2(`${emoji.timeout} **Autoplay selection timed out.**`)).catch(() => {});
    });
  },
};

