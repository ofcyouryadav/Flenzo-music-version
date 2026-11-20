/** @format
 * flenzo Music Bot — Track Error Event
 * Developer: Yadav
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "trackError",
  async execute(client, player, track, error) {
    console.error(`[flenzo] Track error in ${player.guildId}:`, error?.message);

    const channel = client.channels.cache.get(player.textChannelId);
    if (!channel) return;

    const msg = await channel.send({
      components: [
        new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `<a:karma_wrong_time:1484885465944559616> **Track Error!**\n` +
            `> Could not play \`${track?.info?.title || "Unknown"}\`\n` +
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
    }
  },
};

