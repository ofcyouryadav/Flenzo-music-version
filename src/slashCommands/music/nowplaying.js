/** @format
 * flenzo Music Bot — /nowplaying Slash Command
 * Developer: Yadav
 */

const { SlashCommandBuilder } = require("discord.js");
const npCmd = require("../../commands/music/nowplaying");

module.exports = {
  premium: true,
  ownerOnly: false,
  inVoice: false,
  sameVoice: false,
  needPlayer: true,

  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show the currently playing song with card"),

  async execute(client, interaction) {
    await interaction.deferReply();
    const fakeMsg = {
      reply: (payload) => interaction.editReply(payload),
      author: interaction.user,
      guild: interaction.guild,
      channel: interaction.channel,
    };
    await npCmd.execute(client, fakeMsg, []);
  },
};

