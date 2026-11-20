/** @format
 * flenzo Music Bot — Voice State Update
 * Developer: Yadav
 */

module.exports = {
  name: "voiceStateUpdate",
  async execute(client, oldState, newState) {
    // Bot left VC
    if (newState.id === client.user.id && !newState.channelId) {
      const player = client.lavalink.getPlayer(newState.guild.id);
      if (player) {
        client.voiceStatus.updateForEnd(player).catch(() => {});
        await player.destroy().catch(() => {});
      }
      return;
    }

    // Bot moved to different VC
    if (
      newState.id === client.user.id &&
      oldState.channelId &&
      newState.channelId &&
      oldState.channelId !== newState.channelId
    ) {
      const player = client.lavalink.getPlayer(newState.guild.id);
      if (player) {
        client.voiceStatus.stopIdleRotator(oldState.channelId);
        client.voiceStatus.updateForStart(player).catch(() => {});
      }
      return;
    }

    // All members left VC — pause after 30s
    if (oldState.channelId && !newState.channelId) {
      const player = client.lavalink.getPlayer(oldState.guild.id);
      if (!player) return;
      const channel = oldState.channel;
      if (!channel) return;
      const members = channel.members.filter(m => !m.user.bot);
      if (members.size === 0 && player.playing) {
        setTimeout(async () => {
          const p = client.lavalink.getPlayer(oldState.guild.id);
          if (!p) return;
          const ch = oldState.guild.channels.cache.get(p.voiceChannelId);
          const humanMembers = ch?.members.filter(m => !m.user.bot) || { size: 0 };
          if (humanMembers.size === 0) {
            await p.pause(true);
            client.voiceStatus.updateForPause(p, true).catch(() => {});
          }
        }, 30000);
      }
    }
  },
};

