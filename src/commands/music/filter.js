/** @format
 * flenzo Music Bot — Filter Command (Premium)
 * Developer: Yadav
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
} = require("discord.js");
const { cv2 } = require("../../utils/cv2");
const emoji = require("../../emoji");

const FILTERS = {
  bassboost: { equalizer: [{ band: 0, gain: 0.6 }, { band: 1, gain: 0.7 }, { band: 2, gain: 0.8 }] },
  nightcore: { timescale: { speed: 1.3, pitch: 1.3, rate: 1.0 } },
  vaporwave: { timescale: { speed: 0.8, pitch: 0.8, rate: 1.0 } },
  "8d":      { rotation: { rotationHz: 0.2 } },
  karaoke:   { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220, filterWidth: 100 } },
  tremolo:   { tremolo: { frequency: 2.0, depth: 0.5 } },
  vibrato:   { vibrato: { frequency: 2.0, depth: 0.5 } },
  clear:     {},
};

module.exports = {
  name: "filter",
  aliases: ["f", "fx"],
  description: "Apply audio filters to the player",
  category: "music",
  usage: "[filter name]",
  cooldown: 3,
  premium: true,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: true,

  async execute(client, message, args) {
    const player = client.lavalink.getPlayer(message.guild.id);
    const name   = (args[0] || "").toLowerCase();

    if (!name || !FILTERS[name]) {
      const options = Object.keys(FILTERS).filter(k => k !== "clear").map(k => ({
        label: k.charAt(0).toUpperCase() + k.slice(1),
        value: k,
        description: `Apply ${k} filter`,
      }));
      options.push({ label: "Clear All Filters", value: "clear", description: "Remove all filters" });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("flenzo_filter")
        .setPlaceholder(`${emoji.filter} Select a filter...`)
        .addOptions(options);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**${emoji.filter} Audio Filters**\n-# Select a filter to apply`)
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            Object.keys(FILTERS).filter(k => k !== "clear").map(k => `> \`${k}\``).join("  ") + `  \`clear\``
          )
        );

      const m = await message.reply({
        components: [container, new ActionRowBuilder().addComponents(menu)],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      }).catch(() => {});

      if (!m) return;

      const collector = m.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: 30000,
      });

      collector.on("collect", async (interaction) => {
        const selected = interaction.values[0];
        await player.filters.setFilters(FILTERS[selected]);
        await interaction.update(cv2(`${emoji.success} **Filter \`${selected}\` applied!**`)).catch(() => {});
        collector.stop();
      });

      collector.on("end", (col) => {
        if (!col.size) m.edit(cv2(`${emoji.timeout} **Filter selection timed out.**`)).catch(() => {});
      });

      return;
    }

    await player.filters.setFilters(FILTERS[name]);
    return message.reply(cv2(
      name === "clear"
        ? `${emoji.success} **All filters cleared!**`
        : `${emoji.success} **Filter \`${name}\` applied!**`
    )).catch(() => {});
  },
};

