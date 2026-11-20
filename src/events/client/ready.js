/** @format
 * flenzo Music Bot — Ready Event
 */

const { ActivityType } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`[flenzo] ✅ Logged in as ${client.user.tag}`);

    // Init Lavalink
    await client.lavalink.init(
      { id: client.user.id, username: client.user.username },
      { shards: 1, botId: client.user.id }
    );

    // Load blacklist into memory
    try {
      const mongoose = require("mongoose");
      const Blacklist = mongoose.models.flenzoBlacklist;
      if (Blacklist) {
        const list = await Blacklist.find();
        client.blacklist = new Set(list.map(b => b.userId));
        console.log(`[flenzo] ✅ Loaded ${client.blacklist.size} blacklisted users`);
      } else {
        client.blacklist = new Set();
      }
    } catch { client.blacklist = new Set(); }

    // Voice status cleanup
    client.voiceStatus.startCleanup();

    // Presence
    client.user.setPresence({
      status: "dnd",
      activities: [{
        name: `.help | flenzo Music`,
        type: ActivityType.Listening,
      }],
    });
  },
};

