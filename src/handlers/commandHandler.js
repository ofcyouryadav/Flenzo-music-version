/** @format
 * flenzo Music Bot — Command Handler
 */

const fs   = require("fs");
const path = require("path");

module.exports = (client) => {
  const cmdPath = path.join(__dirname, "../commands");
  const categories = fs.readdirSync(cmdPath);

  let loaded = 0;
  for (const cat of categories) {
    const files = fs.readdirSync(path.join(cmdPath, cat)).filter(f => f.endsWith(".js"));
    for (const file of files) {
      const cmd = require(path.join(cmdPath, cat, file));
      if (!cmd.name) continue;
      client.commands.set(cmd.name, cmd);
      if (cmd.aliases?.length) {
        for (const alias of cmd.aliases) client.commands.set(alias, cmd);
      }
      loaded++;
    }
  }
  console.log(`[flenzo] ✅ Loaded ${loaded} prefix commands`);
};

