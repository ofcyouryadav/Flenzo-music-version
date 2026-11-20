/** @format
 * flenzo Music Bot — Node Disconnect Event
 * Developer: Yadav
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "nodeDisconnect",
  async execute(client, node, reason) {
    console.warn(`[flenzo] <a:karma_warning_animated:1484885801123713196> Lavalink node "${node.id}" disconnected:`, reason);

    // Notify all active players
    for (const [guildId, player] of client.lavalink.players) {
      const channel = client.channels.cache.get(player.textChannelId);
      if (!channel) continue;

      const msg = await channel.send({
        components: [
          new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `<a:karma_warning_animated:1484885801123713196> **Lavalink node disconnected!**\n` +
              `-# Music may be interrupted. Reconnecting...`
            )
          ),
        ],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      }).catch(() => { });

      if (msg) setTimeout(() => msg.delete().catch(() => { }), 8000);

      client.voiceStatus.updateForEnd(player).catch(() => { });
    }
  },
};

