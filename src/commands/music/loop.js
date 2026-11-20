/** @format
 * flenzo Music Bot — Loop Command
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "loop",
  aliases: ["repeat", "lp"],
  description: "Set loop mode (off / track / queue)",
  category: "music",
  usage: "[off | track | queue]",
  cooldown: 2,
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: true,

  async execute(client, message, args) {
    const player = client.lavalink.getPlayer(message.guild.id);
    const modes = ["off", "track", "queue"];
    const mode = (args[0] || "").toLowerCase();

    if (!modes.includes(mode))
      return message.reply(cv2(`**Current loop:** \`${player.repeatMode || "off"}\`\nUsage: \`${client.prefix}loop <off|track|queue>\``)).catch(() => { });

    player.setRepeatMode(mode === "off" ? "none" : mode);
    return message.reply(cv2(`**Loop set to \`${mode}\`**`)).catch(() => { });
  },
};

