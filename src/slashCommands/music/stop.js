/** @format
 * flenzo Music Bot — /stop Slash Command
 * Developer: Yadav
 */

const { SlashCommandBuilder } = require("discord.js");
const { cv2 } = require("../../utils/cv2");

module.exports = {
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: true,

  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop music and disconnect bot"),

  async execute(client, interaction) {
    const player = client.lavalink.getPlayer(interaction.guild.id);
    player.set("autoplay", false);
    await player.destroy();
    client.voiceStatus.updateForEnd(player).catch(() => {});
    return interaction.reply(cv2(`⏹ **Stopped and disconnected.**`));
  },
};

