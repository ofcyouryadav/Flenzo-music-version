/** @format
 * flenzo Music Bot — 247 Command (Premium)
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");
const Guild   = require("../../database/schemas/Guild");

module.exports = {
  name: "247",
  aliases: ["24/7", "stay"],
  description: "Toggle 24/7 mode — bot stays in VC",
  category: "music",
  usage: "",
  cooldown: 5,
  premium: true,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: false,

  async execute(client, message) {
    let guildData = await Guild.findOne({ guildId: message.guild.id });
    if (!guildData) guildData = new Guild({ guildId: message.guild.id });

    guildData.is247 = !guildData.is247;

    if (guildData.is247) {
      guildData.voiceId = message.member.voice.channelId;
      guildData.textId  = message.channel.id;
    } else {
      
      guildData.voiceId = null;
      guildData.textId  = null;
    }

    await guildData.save();

    const on = guildData.is247;

    if (on) {
      let player = client.lavalink.getPlayer(message.guild.id);
      if (!player) {
        player = await client.lavalink.createPlayer({
          guildId:        message.guild.id,
          voiceChannelId: message.member.voice.channelId,
          textChannelId:  message.channel.id,
          selfDeaf:       true,
          volume:         80,
        });
        if (!player.connected) await player.connect();
      }
      client.voiceStatus?.startIdleRotator(message.member.voice.channelId);
    } else {
      client.voiceStatus?.stopIdleRotator(message.member.voice.channelId);
    }

    return message.reply(cv2(
      on
        ? `🟢 **24/7 Mode enabled!** Bot will stay in VC.`
        : `🔴 **24/7 Mode disabled!** Bot will leave when queue ends.`
    )).catch(() => {});
  },
};