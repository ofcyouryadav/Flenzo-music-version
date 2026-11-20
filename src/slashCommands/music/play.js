/** @format
 * flenzo Music Bot — /play Slash Command
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
  needPlayer: false,

  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song by name or URL")
    .addStringOption(opt =>
      opt.setName("query").setDescription("Song name or URL").setRequired(true)
    ),

  async execute(client, interaction) {
    const query = interaction.options.getString("query");
    await interaction.deferReply({ flags: 0 });

    let player = client.lavalink.getPlayer(interaction.guild.id);
    if (!player) {
      player = await client.lavalink.createPlayer({
        guildId:        interaction.guild.id,
        voiceChannelId: interaction.member.voice.channelId,
        textChannelId:  interaction.channel.id,
        selfDeaf:       true,
        volume:         80,
      });
    }
    if (!player.connected) await player.connect();

    const res = await player.search({ query }, interaction.user).catch(() => null);

    if (!res || !res.tracks.length)
      return interaction.editReply(cv2(`${emoji.error} **No results found for:** \`${query}\``)).catch(() => {});

    if (res.loadType === "playlist") {
      for (const t of res.tracks) await player.queue.add(t);
      await interaction.editReply(cv2(`${emoji.success} **Added playlist** \`${res.playlist?.name}\` — \`${res.tracks.length} tracks\``)).catch(() => {});
    } else {
      await player.queue.add(res.tracks[0]);
      const link = res.tracks[0].info?.uri?.startsWith("http") ? res.tracks[0].info.uri : client.support;
      await interaction.editReply(cv2(`${emoji.success} **Added to queue** [${res.tracks[0].info.title.replace(/[\[\]]/g, "")}](${link})`)).catch(() => {});
    }

    if (!player.playing && !player.paused) await player.play();
  },
};

