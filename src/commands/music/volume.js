/** @format
 * flenzo Music Bot — Volume Command
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "volume",
  aliases: ["vol", "v"],
  description: "Set the player volume",
  category: "music",
  usage: "<1-100>",
  cooldown: 2,
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: true,

  async execute(client, message, args) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!args[0])
      return message.reply(cv2(`**Current volume:** \`${player.volume}%\``)).catch(() => { });
    const vol = parseInt(args[0]);
    if (isNaN(vol) || vol < 1 || vol > 100)
      return message.reply(cv2(`**Volume must be between \`1\` and \`100\`.**`)).catch(() => { });
    await player.setVolume(vol);
    return message.reply(cv2(`**Volume set to \`${vol}%\`**`)).catch(() => { });
  },
};

