/** @format
 * flenzo Music Bot — Play Command
 * Developer: Yadav
 */

const { cv2 } = require("../../utils/cv2");
const emoji = require("../../emoji");

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Play a song by name or URL",
  category: "music",
  usage: "<song name / url>",
  cooldown: 3,
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: false,

  async execute(client, message, args) {
    const query = args.join(" ");
    if (!query)
      return message.reply(cv2(`${emoji.bell} **No query provided!**\nUsage: \`${client.prefix}play <song name>\``)).catch(() => {});

    const x = await message.reply(cv2(`${emoji.search} **Searching please wait...**`)).catch(() => {});

    let player = client.lavalink.getPlayer(message.guild.id);
    if (!player) {
      player = await client.lavalink.createPlayer({
        guildId:        message.guild.id,
        voiceChannelId: message.member.voice.channelId,
        textChannelId:  message.channel.id,
        selfDeaf:       true,
        selfMute:       false,
        volume:         80,
      });
    }

    if (!player.connected) await player.connect();

    const isUrl = /^https?:\/\//i.test(query);
    const res = await player.search(
      isUrl
        ? { query, source: "url" }          // direct URL
        : { query, source: "ytmsearch" },   // YouTube Music by default
      message.author
    ).catch(() => null);

    // Fallback to YouTube if YT Music returns nothing
    let finalRes = res;
    if (!res?.tracks?.length) {
      finalRes = await player.search(
        { query, source: "ytsearch" },
        message.author
      ).catch(() => null);
    }

    if (!finalRes || !finalRes.tracks.length)
      return x?.edit(cv2(`${emoji.error} **No results found for:** \`${query}\``)).catch(() => {});

    if (finalRes.loadType === "playlist") {
      for (const track of finalRes.tracks) await player.queue.add(track);
      await x?.edit(
        cv2(`${emoji.success} **Added playlist** \`${finalRes.playlist?.name}\` — \`${finalRes.tracks.length} tracks\``)
      ).catch(() => {});
    } else {
      await player.queue.add(finalRes.tracks[0]);
      const link = finalRes.tracks[0].info?.uri?.startsWith("http") ? finalRes.tracks[0].info.uri : client.support;
      await x?.edit(
        cv2(`${emoji.success} **Added to queue** [${finalRes.tracks[0].info.title.replace(/[\[\]]/g, "")}](${link})`)
      ).catch(() => {});
    }

    if (!player.playing && !player.paused) await player.play();
  },
};

