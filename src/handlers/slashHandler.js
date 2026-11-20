/** @format
 * flenzo Music Bot — Slash Command Handler
 */

const fs   = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

module.exports = async (client) => {
  const slashPath = path.join(__dirname, "../slashCommands");
  const categories = fs.readdirSync(slashPath);
  const slashData  = [];

  for (const cat of categories) {
    const files = fs.readdirSync(path.join(slashPath, cat)).filter(f => f.endsWith(".js"));
    for (const file of files) {
      const cmd = require(path.join(slashPath, cat, file));
      if (!cmd.data) continue;
      client.slashCommands.set(cmd.data.name, cmd);
      slashData.push(cmd.data.toJSON());
    }
  }

  console.log(`[flenzo] ✅ Loaded ${slashData.length} slash commands`);

  // Register on ready
  client.once("ready", async () => {
    try {
      const rest = new REST().setToken(client.config.token);
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: slashData }
      );
      console.log("[flenzo] ✅ Slash commands registered globally");
    } catch (err) {
      console.error("[flenzo] ❌ Slash register error:", err);
    }
  });
};

