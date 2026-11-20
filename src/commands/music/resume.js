/** @format
 * flenzo Music Bot — Resume Command
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");
const emoji = require("../../emoji");

module.exports = {
  name: "resume",
  aliases: ["r"],
  description: "Resume the paused player",
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
    if (!player.paused)
      return message.reply(cv2(`${emoji.error} **Player is not paused.**`)).catch(() => {});
    await player.pause(false);
    client.voiceStatus.updateForPause(player, false).catch(() => {});
    return message.reply(cv2(`${emoji.play} **Resumed the player.**`)).catch(() => {});
  },
};

