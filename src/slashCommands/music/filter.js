/** @format
 * flenzo Music Bot — /filter Slash Command
 * Developer: Yadav
 */

const { SlashCommandBuilder } = require("discord.js");
const filterCmd = require("../../commands/music/filter");

module.exports = {
  premium: true,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: true,

  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Apply audio filters (Premium)")
    .addStringOption(opt =>
      opt.setName("name")
        .setDescription("Filter name")
        .setRequired(false)
        .addChoices(
          { name: "Bass Boost", value: "bassboost" },
          { name: "Nightcore",  value: "nightcore" },
          { name: "Vaporwave",  value: "vaporwave" },
          { name: "8D Audio",   value: "8d" },
          { name: "Karaoke",    value: "karaoke" },
          { name: "Tremolo",    value: "tremolo" },
          { name: "Vibrato",    value: "vibrato" },
          { name: "Clear All",  value: "clear" },
        )
    ),

  async execute(client, interaction) {
    await interaction.deferReply();
    const fakeMsg = {
      reply: (payload) => interaction.editReply(payload),
      author: interaction.user,
      guild: interaction.guild,
      channel: interaction.channel,
    };
    const args = interaction.options.getString("name") ? [interaction.options.getString("name")] : [];
    await filterCmd.execute(client, fakeMsg, args);
  },
};

