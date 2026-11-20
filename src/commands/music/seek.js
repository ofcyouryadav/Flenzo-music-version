/** @format
 * flenzo Music Bot — Seek Command (Premium)
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");
const ms = require("ms");

module.exports = {
  name: "seek",
  aliases: ["sk"],
  description: "Seek to a position in the current song",
  category: "music",
  usage: "<time e.g. 1m30s>",
  cooldown: 2,
  premium: true,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: true,

  async execute(client, message, args) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!args[0])
      return message.reply(cv2(`**Usage:** \`${client.prefix}seek <time>\`\nExample: \`${client.prefix}seek 1m30s\``)).catch(() => { });
    if (player.queue.current?.info?.isStream)
      return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Cannot seek in a live stream.**`)).catch(() => { });
    const time = ms(args[0]);
    if (!time || time < 0)
      return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Invalid time format.** Use: \`1m30s\`, \`90s\`, \`2m\``)).catch(() => { });
    if (time > player.queue.current.info.duration)
      return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Time exceeds track duration.**`)).catch(() => { });
    await player.seek(time);
    return message.reply(cv2(`<a:karma_TICK:1484879254306164826> **Seeked to \`${args[0]}\`**`)).catch(() => { });
  },
};

