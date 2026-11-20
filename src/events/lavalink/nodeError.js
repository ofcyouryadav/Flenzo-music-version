/** @format
 * flenzo Music Bot — Node Error Event
 */

module.exports = {
  name: "nodeError",
  execute(client, node, error) {
    console.error(`[flenzo] Lavalink Node Error on ${node.id}:`, error?.message || error);
  },
};

