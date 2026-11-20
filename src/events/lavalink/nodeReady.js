/** @format
 * flenzo Music Bot — Node Ready Event
 */

module.exports = {
  name: "nodeConnect",
  async execute(client, node) {
    console.log(`[flenzo] ✅ Lavalink node "${node.id}" connected`);
  },
};

