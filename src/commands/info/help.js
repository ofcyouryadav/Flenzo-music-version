/** @format
 * flenzo Music Bot — Help Command
 * Developer: Yadav
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  MessageFlags,
} = require("discord.js");
const emoji = require("../../emoji");

const CAT_ICONS = {
  music: emoji.music,
  owner: emoji.crown,
  info: emoji.info,
};

module.exports = {
  name: "help",
  aliases: ["h", "cmds"],
  description: "Show the help menu",
  category: "info",
  usage: "[command]",
  cooldown: 5,
  premium: false,
  ownerOnly: false,
  inVoice: false,
  sameVoice: false,
  needPlayer: false,

  async execute(client, message, args) {
    const normalize = (s) => s?.toLowerCase();

    const allCmds = [...new Set(client.commands.values())];
    const cats = [...new Set(allCmds.map(c => normalize(c.category)).filter(Boolean))]
      .filter(c => c !== "owner" || client.isOwner(message.author.id));
    const totalCmds = allCmds.length;

    const maxCmds = Math.max(...cats.map(c => allCmds.filter(cmd => normalize(cmd.category) === c).length));

    const catBars = cats.map(c => {
      const count = allCmds.filter(cmd => normalize(cmd.category) === c).length;
      const filled = Math.round((count / maxCmds) * 5);
      const bar = emoji.filled_bar.repeat(filled) + emoji.empty_bar.repeat(5 - filled);
      const icon = CAT_ICONS[c] || emoji.folder;
      return `${icon} **${c.charAt(0).toUpperCase() + c.slice(1)}** ${bar} \`${count}\``;
    }).join("\n");

    const menuRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("flenzo_help_cat")
        .setPlaceholder(`${emoji.open_folder} Choose a category...`)
        .addOptions(
          cats.map(c => ({
            label: c.charAt(0).toUpperCase() + c.slice(1),
            description: `${allCmds.filter(cmd => normalize(cmd.category) === c).length} commands`,
            value: c,
            emoji: CAT_ICONS[c] || emoji.folder,
          }))
        )
    );

    const btnRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("flenzo_help_home").setLabel("Home").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("flenzo_help_close").setLabel("Close").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setLabel("Support").setStyle(ButtonStyle.Link).setURL(client.support),
    );

    const homeContainer = new ContainerBuilder()
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**${emoji.music} flenzo Music — Help Menu**\n` +
              `-# \`${totalCmds}\` commands  •  Prefix: \`${client.prefix}\``
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder()
              .setURL(client.user.displayAvatarURL({ extension: "png" }))
              .setDescription("flenzo")
          )
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(catBars))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# Built with ${emoji.heart} by Her.Yadav  •  [Support](${client.support})`
        )
      )
      .addActionRowComponents(menuRow, btnRow);

    const sent = await message.reply({
      components: [homeContainer],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => { });

    if (!sent) return;

    const collector = sent.createMessageComponentCollector({
      filter: (i) => {
        if (i.user.id !== message.author.id) {
          i.reply({ content: `${emoji.error} Not your menu.`, ephemeral: true }).catch(() => { });
          return false;
        }
        return true;
      },
      time: 120000,
    });

    collector.on("collect", async (interaction) => {
      const id = interaction.customId;

      if (id === "flenzo_help_close") {
        collector.stop("closed");
        return interaction.update({
          components: [new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${emoji.success} Help menu closed.\n-# Use \`${client.prefix}help\` to open again.`)
          )],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] },
        });
      }

      if (id === "flenzo_help_home") {
        return interaction.update({
          components: [homeContainer],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] },
        });
      }

      if (id === "flenzo_help_cat") {
        const cat = interaction.values[0];
        const cmds = [...new Set(allCmds.filter(c => normalize(c.category) === cat))];

        const chunks = [];
        for (let i = 0; i < cmds.length; i += 5) chunks.push(cmds.slice(i, i + 5));
        const cmdDisplay = chunks.map(row => row.map(c => `\`${c.name}\``).join("  ")).join("\n");

        const premCmds = cmds.filter(c => c.premium).map(c => c.name);
        const notes = premCmds.length ? `\n> ${emoji.crown} **Premium:** ${premCmds.map(n => `\`${n}\``).join(", ")}` : "";

        const catContainer = new ContainerBuilder()
          .addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `**${CAT_ICONS[cat] || emoji.folder} ${cat.charAt(0).toUpperCase() + cat.slice(1)} Commands**\n` +
                  `-# ${cmds.length} commands in this category`
                )
              )
              .setThumbnailAccessory(
                new ThumbnailBuilder()
                  .setURL(client.user.displayAvatarURL({ extension: "png" }))
                  .setDescription("flenzo")
              )
          )
          .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(cmdDisplay || "No commands."))
          .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              notes
                ? `**Notes**\nPremium: ${premCmds.map(n => `\`${n}\``).join(", ")}`
                : `-# Use \`${client.prefix}help <command>\` for details`
            )
          )
          .addActionRowComponents(
            menuRow,
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId("flenzo_help_home").setLabel("Home").setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId("flenzo_help_close").setLabel("Close").setStyle(ButtonStyle.Danger),
              new ButtonBuilder().setLabel("Support").setStyle(ButtonStyle.Link).setURL(client.support),
            )
          );

        return interaction.update({
          components: [catContainer],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] },
        });
      }
    });

    collector.on("end", async (_, reason) => {
      if (reason === "closed") return;
      sent.edit({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${emoji.timeout} Help menu expired.\n-# Use \`${client.prefix}help\` to open again.`)
        )],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      }).catch(() => { });
    });
  },
};

