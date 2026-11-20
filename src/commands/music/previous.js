/** @format
 * flenzo Music Bot — Previous Command
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "previous",
  aliases: ["prev", "back"],
  description: "Play the previous song",
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
    const prev = player.queue.previous?.[0];

    if (!prev)
      return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **No previously played song found.**`)).catch(() => { });

    await player.play({ track: prev });
    const link = prev.info?.uri?.startsWith("http") ? prev.info.uri : client.support;
    return message.reply(
      cv2(`**Playing previous** [${prev.info.title.replace(/[\[\]]/g, "")}](${link})`)
    ).catch(() => { });
  },
};

