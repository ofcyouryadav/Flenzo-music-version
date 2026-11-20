/** @format - flenzo — Saved Playlists (Premium) */
const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, StringSelectMenuBuilder, MessageFlags,
} = require("discord.js");
const { cv2 } = require("../../utils/cv2");
const mongoose = require("mongoose");

const Saved = mongoose.models.flenzoSaved || mongoose.model("flenzoSaved", new mongoose.Schema({
  userId: String, name: String,
  tracks: [{ title: String, uri: String, duration: Number, author: String }],
  savedAt: { type: Date, default: Date.now },
}));

module.exports = {
  name: "playlists", aliases: ["pl"],
  description: "View and load saved playlists",
  category: "music", cooldown: 5, premium: true,
  inVoice: false, sameVoice: false, needPlayer: false,

  async execute(client, message) {
    const lists = await Saved.find({ userId: message.author.id });
    if (!lists.length) return message.reply(cv2(`❌ **No saved playlists.**\n-# Use \`.save [name]\` to save current queue.`)).catch(() => {});

    const options = lists.map((pl, i) => ({
      label: pl.name.substring(0, 50),
      description: `${pl.tracks.length} tracks • ${new Date(pl.savedAt).toLocaleDateString()}`,
      value: pl._id.toString(),
    }));

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `**💾 Your Playlists — ${lists.length}/3**\n` +
        lists.map((pl, i) => `> \`${i+1}.\` **${pl.name}** — \`${pl.tracks.length} tracks\``).join("\n")
      ))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Select a playlist to load or delete`))
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder().setCustomId("flenzo_pl_select").setPlaceholder("🎵 Select playlist...").addOptions(options)
        )
      );

    const m = await message.reply({
      components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] },
    }).catch(() => {});
    if (!m) return;

    const col = m.createMessageComponentCollector({
      filter: i => { if (i.user.id !== message.author.id) { i.reply({ content: "❌ Not yours.", ephemeral: true }).catch(() => {}); return false; } return true; },
      time: 60000,
    });

    col.on("collect", async i => {
      const pl = await Saved.findById(i.values[0]);
      if (!pl) return i.reply({ content: "❌ Playlist not found.", ephemeral: true }).catch(() => {});

      let player = client.lavalink.getPlayer(message.guild.id);
      if (!i.member?.voice?.channel) return i.reply({ content: "🔊 Join a voice channel first!", ephemeral: true }).catch(() => {});

      if (!player) {
        player = await client.lavalink.createPlayer({
          guildId: message.guild.id,
          voiceChannelId: i.member.voice.channelId,
          textChannelId: message.channel.id,
          selfDeaf: true, volume: 80,
        });
      }
      if (!player.connected) await player.connect();

      for (const t of pl.tracks) {
        const res = await player.search({ query: t.uri || t.title, source: t.uri ? "url" : "spsearch" }, message.author).catch(() => null);
        if (res?.tracks?.[0]) await player.queue.add(res.tracks[0]);
      }
      if (!player.playing && !player.paused) await player.play();

      await i.deferUpdate().catch(() => {});
      m.edit(cv2(`✅ **Loaded playlist** \`${pl.name}\` — \`${pl.tracks.length} tracks\``)).catch(() => {});
      col.stop();
    });
  },
};

