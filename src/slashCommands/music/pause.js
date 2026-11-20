/** @format
 * flenzo Music Bot — /pause Slash Command
 * Developer: Yadav
 */

const { SlashCommandBuilder } = require("discord.js");
const { cv2 } = require("../../utils/cv2");
const emoji = require("../../emoji");

module.exports = {
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: true,

  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song"),

  async execute(client, interaction) {
    const player = client.lavalink.getPlayer(interaction.guild.id);
    if (player.paused)
      return interaction.reply({ ...cv2(`${emoji.error} **Already paused.**`), ephemeral: true });
    await player.pause(true);
    client.voiceStatus.updateForPause(player, true).catch(() => {});
    return interaction.reply(cv2(`${emoji.pause} **Paused the player.**`));
  },
};

