/** @format - flenzo Music Bot — Stats Command */
const {
  ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder,
  SeparatorBuilder, SeparatorSpacingSize, MessageFlags,
} = require("discord.js");

function formatUptime(ms = 0) {
  if (!ms || ms <= 0) return "0s";
  let s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400); s %= 86400;
  const h = Math.floor(s / 3600);  s %= 3600;
  const m = Math.floor(s / 60);    s %= 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s) parts.push(`${s}s`);
  return parts.join(" ") || "0s";
}

module.exports = {
  name: "stats", aliases: ["botstats", "info"],
  description: "Show bot statistics",
  category: "info", cooldown: 5, premium: false, ownerOnly: false,
  inVoice: false, sameVoice: false, needPlayer: false,

  async execute(client, message) {
    const uptime   = process.uptime();
    const h = Math.floor(uptime / 3600), m = Math.floor((uptime % 3600) / 60), s = Math.floor(uptime % 60);
    const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const ping     = client.ws.ping;
    const pingEmoji = ping < 80 ? "<a:karma_Online:1484886897213050992>" : ping < 150 ? "🟡" : "<a:karma_offline:1484887092935790702>";
    const guilds   = client.guilds.cache.size;
    const users    = client.guilds.cache.reduce((a, g) => a + (g.memberCount || 0), 0);

    // ── Lavalink nodes via nodeManager ────────────────────────────────────
    let nodeBlocks    = [];
    let totalPlayers  = 0;
    let totalPlaying  = 0;

    try {
      const nodeMap = client.lavalink?.nodeManager?.nodes;
      if (nodeMap?.size) {
        for (const node of nodeMap.values()) {
          const stats     = node.stats || {};
          const connected = typeof stats.uptime === "number" && stats.uptime > 0;
          const players   = stats.players       || 0;
          const playing   = stats.playingPlayers || 0;
          const nodeUp    = formatUptime(stats.uptime || 0);

          totalPlayers += players;
          totalPlaying += playing;

          nodeBlocks.push(
            `${connected ? "<a:karma_Online:1484886897213050992>" : "<a:karma_offline:1484887092935790702>"} **Node: ${node.id}**\n` +
            `> • Status: ${connected ? "Online" : "Offline"}\n` +
            `> • Uptime: \`${nodeUp}\`\n` +
            `> • Players: \`${players}\`  •  Playing: \`${playing}\``
          );
        }
      }
    } catch {}

    const lavaSection = nodeBlocks.length
      ? nodeBlocks.join("\n\n") +
        `\n\n<a:karma_Flower:1484879202422493215> **This Bot**\n> • Players: \`${totalPlayers}\`  •  Playing: \`${totalPlaying}\``
      : "`No nodes connected`";

    const container = new ContainerBuilder()
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**<a:karma_play:1484878711307108543> flenzo Music — Stats**\n-# By Yadav`
          ))
          .setThumbnailAccessory(new ThumbnailBuilder()
            .setURL(client.user.displayAvatarURL({ extension: "png" }))
            .setDescription("flenzo"))
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `**<a:karma_WorkingOnIt:1484887012002500708> Bot**\n` +
        `> ${pingEmoji} **Ping:** \`${ping}ms\`\n` +
        `> <a:karma_bell:1484886035677577316> **Uptime:** \`${h}h ${m}m ${s}s\`\n` +
        `> <:karma_stats:1484875437443387524> **Memory:** \`${memUsage} MB\`\n` +
        `> <:A_Flower2_pink_karma:1484879138417279136> **Servers:** \`${guilds}\`\n` +
        `> <:karma_User:1484878567744602112> **Users:** \`${users.toLocaleString()}\``
      ))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `**<a:karma_play:1484878711307108543> Lavalink**\n${lavaSection}`
      ))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `-# [Support](${client.support})  •  [Invite flenzo](${client.config.invite})`
      ));

    return message.reply({
      components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] },
    }).catch(() => {});
  },
};

