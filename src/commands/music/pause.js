/** @format
 * flenzo Music Bot — Pause Command
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");
const emoji = require("../../emoji");

module.exports = {
  name: "pause",
  aliases: ["pa"],
  description: "Pause the current song",
  category: "music",
  usage: "",
  cooldown: 2,
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: true,

  async execute(client, message) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (player.paused)
      return message.reply(cv2(`${emoji.error} **Player is already paused.**`)).catch(() => {});
    await player.pause(true);
    client.voiceStatus.updateForPause(player, true).catch(() => {});
    return message.reply(cv2(`${emoji.pause} **Paused the player.**`)).catch(() => {});
  },
};

