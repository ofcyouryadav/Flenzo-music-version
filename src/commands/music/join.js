/** @format
 * flenzo Music Bot — Join Command
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "join",
  aliases: ["j", "connect"],
  description: "Summons the bot to your voice channel",
  category: "music",
  usage: "",
  cooldown: 5,
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: false,
  needPlayer: false, // We don't need a player to exist beforehand

  async execute(client, message, args) {
    let player = client.lavalink.getPlayer(message.guild.id);

    if (player && player.connected) {
      if (player.voiceChannelId === message.member.voice.channelId) {
        return message.reply(cv2(`**I'm already in your voice channel!**`)).catch(() => { });
      } else {
        return message.reply(cv2(`**I'm already connected to <#${player.voiceChannelId}>**`)).catch(() => { });
      }
    }

    if (!player) {
      player = await client.lavalink.createPlayer({
        guildId: message.guild.id,
        voiceChannelId: message.member.voice.channelId,
        textChannelId: message.channel.id,
        selfDeaf: true,
        selfMute: false,
        volume: 80,
      });
    }

    await player.connect();
    return message.reply(cv2(`<a:karma_TICK:1484879254306164826> **Successfully joined <#${message.member.voice.channelId}>** bound to <#${message.channel.id}>`)).catch(() => { });
  },
};

