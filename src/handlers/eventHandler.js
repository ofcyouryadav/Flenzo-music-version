/** @format
 * flenzo Music Bot — Event Handler
 */

const fs   = require("fs");
const path = require("path");

module.exports = (client) => {
  const eventsPath = path.join(__dirname, "../events");
  const folders    = fs.readdirSync(eventsPath);

  let loaded = 0;
  for (const folder of folders) {
    const files = fs.readdirSync(path.join(eventsPath, folder)).filter(f => f.endsWith(".js"));
    for (const file of files) {
      const event = require(path.join(eventsPath, folder, file));
      if (!event.name) continue;

      if (folder === "lavalink") {
        // Lavalink events
        client.lavalink.on(event.name, (...args) => event.execute(client, ...args));
      } else {
        // Discord events
        if (event.once) {
          client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
          client.on(event.name, (...args) => event.execute(client, ...args));
        }
      }
      loaded++;
    }
  }
  console.log(`[flenzo] ✅ Loaded ${loaded} events`);
};

