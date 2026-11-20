/** @format
 * flenzo Music Bot — Clear Command
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "clear",
  aliases: ["cl"],
  description: "Clear the queue",
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
      return message.reply(cv2(`❌ **Queue is already empty.**`)).catch(() => {});
    const count = player.queue.tracks.length;
    player.queue.splice(0, count);
    return message.reply(cv2(`🗑️ **Cleared \`${count}\` tracks from the queue.**`)).catch(() => {});
  },
};

