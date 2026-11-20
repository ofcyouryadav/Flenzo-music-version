/** @format
 * flenzo Music Bot — /skip Slash Command
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
    .setName("skip")
    .setDescription("Skip the current song")
    .addIntegerOption(opt =>
      opt.setName("position").setDescription("Skip to a specific position in queue").setRequired(false).setMinValue(1)
    ),

  async execute(client, interaction) {
    const player = client.lavalink.getPlayer(interaction.guild.id);
    if (!player.queue.tracks.length && !player.get("autoplay"))
      return interaction.reply({ ...cv2(`${emoji.error} **No more songs in queue.**`), ephemeral: true });

    const pos = interaction.options.getInteger("position");
    if (pos) player.queue.splice(0, pos - 1);

    await player.skip();
    const next = player.queue.current;
    const link = next?.info?.uri?.startsWith("http") ? next.info.uri : client.support;
    return interaction.reply({
      ...cv2(next ? `${emoji.skip} **Skipped! Now playing** [${next.info.title.replace(/[\[\]]/g, "")}](${link})` : `${emoji.skip} **Skipped.**`),
    });
  },
};

