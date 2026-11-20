/** @format
 * flenzo Music Bot — Track End Event
 */

module.exports = {
  name: "trackEnd",
  async execute(client, player, track) {
    const msg = player.get("nowPlayingMessage");
    if (msg) {
      msg.delete().catch(() => {});
      player.set("nowPlayingMessage", null);
    }
    client.voiceStatus.updateForEnd(player).catch(() => {});
  },
};

