/** @format
 * flenzo Music Bot — Stop Command
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "stop",
  aliases: ["dc", "leave"],
  description: "Stop music and disconnect bot",
  category: "music",
  usage: "",
  cooldown: 3,
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: false,

  async execute(client, message) {
    const player = client.lavalink.getPlayer(message.guild.id);
    player.set("autoplay", false);
    await player.destroy();
    client.voiceStatus.updateForEnd(player).catch(() => { });
    return message.reply(cv2(`**Stopped and disconnected.**`)).catch(() => { });
  },
};

