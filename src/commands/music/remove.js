/** @format
 * flenzo Music Bot — Remove Command
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "remove",
  aliases: ["rm"],
  description: "Remove a song from the queue",
  category: "music",
  usage: "<position>",
  cooldown: 2,
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: true,

  async execute(client, message, args) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!args[0])
      return message.reply(cv2(`**Usage:** \`${client.prefix}remove <position>\``)).catch(() => { });
    const pos = parseInt(args[0]) - 1;
    if (isNaN(pos) || pos < 0 || pos >= player.queue.tracks.length)
      return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Invalid queue position.**`)).catch(() => { });
    const removed = player.queue.tracks[pos];
    player.queue.splice(pos, 1);
    const link = removed.info?.uri?.startsWith("http") ? removed.info.uri : client.support;
    return message.reply(
      cv2(`<a:karma_TICK:1484879254306164826> **Removed** [${removed.info.title.replace(/[\[\]]/g, "")}](${link}) **from queue.**`)
    ).catch(() => { });
  },
};

