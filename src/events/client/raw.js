/** @format
 * flenzo Music Bot — Raw Event (CRITICAL for Lavalink)
 * Developer: Yadav
 * Without this, Lavalink cannot receive voice updates → bot joins but no audio
 */

module.exports = {
  name: "raw",
  async execute(client, data) {
    try {
      if (data.t === "VOICE_SERVER_UPDATE" || data.t === "VOICE_STATE_UPDATE") {
        // console.log(`[flenzo Raw] Received ${data.t} for guild ${data.d.guild_id}`);
      }
      client.lavalink.sendRawData(data);
    } catch (error) {
      console.error("[flenzo] Error in raw event handling (Lavalink voice updates):", error);
    }
  },
};
