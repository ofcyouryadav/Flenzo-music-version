/** @format - flenzo — Save Queue (Premium) */
const { cv2 } = require("../../utils/cv2");
const mongoose = require("mongoose");

const savedSchema = new mongoose.Schema({
  userId: String, name: String,
  tracks: [{ title: String, uri: String, duration: Number, author: String }],
  savedAt: { type: Date, default: Date.now },
});
const Saved = mongoose.models.flenzoSaved || mongoose.model("flenzoSaved", savedSchema);

module.exports = {
  name: "save", aliases: ["savequeue"],
  description: "Save current queue as a playlist",
  category: "music", cooldown: 10, premium: true,
  inVoice: false, sameVoice: false, needPlayer: true,

  async execute(client, message, args) {
    const player = client.lavalink.getPlayer(message.guild.id);
    const name = args.join(" ") || `Queue ${new Date().toLocaleDateString()}`;
    const tracks = [player.queue.current, ...player.queue.tracks].filter(Boolean);

    if (!tracks.length) return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Queue is empty.**`)).catch(() => { });

    // Max 3 saved playlists per user
    const count = await Saved.countDocuments({ userId: message.author.id });
    if (count >= 3) return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Max 3 saved playlists! Delete one first.**\n-# Use \`.playlists\``)).catch(() => { });

    await Saved.create({
      userId: message.author.id, name,
      tracks: tracks.map(t => ({
        title: t.info.title, uri: t.info.uri,
        duration: t.info.duration, author: t.info.author,
      })),
    });

    return message.reply(cv2(
      `<a:karma_TICK:1484879254306164826> **Saved playlist** \`${name}\` — \`${tracks.length} tracks\`\n-# Use \`.playlists\` to view and load`
    )).catch(() => { });
  },
};

