/** @format
 * flenzo Music Bot — /search Slash Command
 * Developer: Yadav
 */

const { SlashCommandBuilder } = require("discord.js");
const searchCmd = require("../../commands/music/search");

module.exports = {
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: false,

  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search songs from multiple sources")
    .addStringOption(opt =>
      opt.setName("query").setDescription("Song name to search").setRequired(true)
    ),

  async execute(client, interaction) {
    await interaction.deferReply();
    const fakeMsg = {
      reply: (payload) => interaction.editReply(payload),
      author: interaction.user,
      guild: interaction.guild,
      channel: interaction.channel,
      member: interaction.member,
    };
    const args = interaction.options.getString("query").split(" ");
    await searchCmd.execute(client, fakeMsg, args);
  },
};

