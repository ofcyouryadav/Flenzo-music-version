/** @format
 * flenzo Music Bot — Track Stuck Event
 * Developer: Yadav
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "trackStuck",
  async execute(client, player, track, thresholdMs) {
    console.error(`[flenzo] Track stuck in ${player.guildId} for ${thresholdMs}ms:`, track?.info?.title);

    const channel = client.channels.cache.get(player.textChannelId);
    if (!channel) return;

    const msg = await channel.send({
      components: [
        new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `<a:karma_warning_animated:1484885801123713196> **Track Stuck!**\n` +
            `> Audio failed to load for \`${track?.info?.title || "Unknown"}\`\n` +
            `-# Skipping to next track...`
          )
        ),
      ],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => {});

    if (msg) setTimeout(() => msg.delete().catch(() => {}), 5000);

    // Skip to next
    if (player.queue.tracks.length > 0) {
      await player.skip().catch(() => {});
    } else {
      await player.stop().catch(() => {});
    }
  },
};

