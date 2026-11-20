/** @format
 * flenzo Music Bot — /resume Slash Command
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
    .setName("resume")
    .setDescription("Resume the paused player"),

  async execute(client, interaction) {
    const player = client.lavalink.getPlayer(interaction.guild.id);
    if (!player.paused)
      return interaction.reply({ ...cv2(`${emoji.error} **Player is not paused.**`), ephemeral: true });
    await player.pause(false);
    client.voiceStatus.updateForPause(player, false).catch(() => {});
    return interaction.reply(cv2(`${emoji.play} **Resumed the player.**`));
  },
};

