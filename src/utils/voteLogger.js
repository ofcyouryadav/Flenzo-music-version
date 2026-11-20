/** @format
 * flenzo Music Bot — Vote Logger
 * Developer: Yadav
 */

const axios = require("axios");

async function sendVoteLog(client, userId) {
  try {
    const webhookURL = process.env.VOTE_WEBHOOK_URL;
    if (!webhookURL) return;

    const user    = await client.users.fetch(userId).catch(() => null);
    const username = user ? user.username : "Unknown User";
    const avatarURL = user?.displayAvatarURL({ size: 256 }) ?? null;
    const now     = Math.floor(Date.now() / 1000);

    await axios.post(webhookURL, {
      username:   "flenzo Votes",
      avatar_url: client.user.displayAvatarURL(),
      embeds: [
        {
          color: 0x9b59b6,
          author: {
            name:     `${username} just voted!`,
            icon_url: avatarURL,
          },
          title: "🗳️ New Vote Received",
          description: [
            `> 👤 **User:** <@${userId}> (\`${userId}\`)`,
            `> 🕐 **Voted at:** <t:${now}:F>`,
            `> ⏰ **Next vote:** <t:${now + 43200}:R>`,
            `> 🏠 **Total servers:** \`${client.guilds.cache.size}\``,
            `> 🎶 **Active players:** \`${client.lavalink?.players?.size ?? 0}\``,
          ].join("\n"),
          footer: { text: "top.gg • flenzo Music Bot" },
          timestamp: new Date().toISOString(),
        },
      ],
    });
  } catch (err) {
    console.error("[VoteLogger] Failed:", err.message);
  }
}

module.exports = { sendVoteLog };