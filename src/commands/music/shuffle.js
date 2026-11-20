/** @format
 * flenzo Music Bot — Shuffle Command
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "shuffle",
  aliases: ["sh"],
  description: "Shuffle the queue",
  category: "music",
  usage: "",
  cooldown: 3,
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: true,

  async execute(client, message) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player.queue.tracks.length)
      return message.reply(cv2(`**Queue is empty!**`)).catch(() => { });
    player.queue.shuffle();
    return message.reply(cv2(`<a:karma_TICK:1484879254306164826> **Queue shuffled!** \`${player.queue.tracks.length} tracks\``)).catch(() => { });
  },
};

