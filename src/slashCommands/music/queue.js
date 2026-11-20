/** @format
 * flenzo Music Bot — /queue Slash Command
 * Developer: Yadav
 */

const { SlashCommandBuilder } = require("discord.js");
const queueCmd = require("../../commands/music/queue");

module.exports = {
  premium: false,
  ownerOnly: false,
  inVoice: false,
  sameVoice: false,
  needPlayer: true,

  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current queue")
    .addIntegerOption(opt =>
      opt.setName("page").setDescription("Page number").setRequired(false).setMinValue(1)
    ),

  async execute(client, interaction) {
    // Wrap interaction to look like a message for shared logic
    await interaction.deferReply();
    const fakeMsg = {
      reply: (payload) => interaction.editReply(payload),
      author: interaction.user,
      guild: interaction.guild,
      channel: interaction.channel,
    };
    const args = interaction.options.getInteger("page") ? [String(interaction.options.getInteger("page"))] : [];
    await queueCmd.execute(client, fakeMsg, args);
  },
};

