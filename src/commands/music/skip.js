/** @format
 * flenzo Music Bot — Skip Command
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");
const emoji = require("../../emoji");

module.exports = {
  name: "skip",
  aliases: ["s", "next"],
  description: "Skip the current song",
  category: "music",
  usage: "[position]",
  cooldown: 2,
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: true,

  async execute(client, message, args) {
    const player = client.lavalink.getPlayer(message.guild.id);

    // No current song playing at all
    if (!player.queue.current)
      return message.reply(cv2(`${emoji.error} **Nothing is currently playing.**`)).catch(() => {});

    const queueSize = player.queue.tracks.length;

    if (args[0]) {
      const pos = parseInt(args[0]);

      // Validate position against actual queue size
      if (isNaN(pos) || pos < 1)
        return message.reply(cv2(`${emoji.error} **Invalid position. Use a number greater than 0.**`)).catch(() => {});

      if (pos > queueSize)
        return message.reply(cv2(`${emoji.error} **Invalid position. Queue only has \`${queueSize}\` song${queueSize !== 1 ? "s" : ""}.**`)).catch(() => {});

      // Remove songs before the target position
      if (pos > 1) player.queue.splice(0, pos - 1);
    } else {
      // No position given — check if skip is even possible
      if (queueSize === 0 && !player.get("autoplay"))
        return message.reply(cv2(`${emoji.error} **No more songs in queue to skip.**`)).catch(() => {});
    }

    await player.skip().catch(() => {});

    const next = player.queue.current;
    const link = next?.info?.uri?.startsWith("http") ? next.info.uri : client.support;

    return message.reply(
      cv2(
        next
          ? `${emoji.skip} **Skipped! Now playing** [${next.info.title.replace(/[\[\]]/g, "")}](${link})`
          : `${emoji.skip} **Skipped.**`
      )
    ).catch(() => {});
  },
};