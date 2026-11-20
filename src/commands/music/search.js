/** @format
 * flenzo Music Bot — Search Command
 * Developer: Yadav
 */

const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { cv2 } = require("../../utils/cv2");

const SOURCES = [
  { engine: "spsearch", label: "Spotify", emoji: "<a:karma_spotify:1484876600586666085>", results: 3 },
  { engine: "ytsearch", label: "YouTube", emoji: "<:FakeNitroEmoji:1484874383620309193>", results: 3 },
  { engine: "ytmsearch", label: "YT Music", emoji: "<:FakeNitroEmoji:1484874383620309193>", results: 3 },
  { engine: "scsearch", label: "SoundCloud", emoji: "<:SoundCloud:1484874343438618675>", results: 3 },
  { engine: "dzsearch", label: "Deezer", emoji: "<:deezer:1484874520727916676>", results: 2 },
  { engine: "amsearch", label: "Apple Music", emoji: "<:applemusic:1484874995388649482>", results: 2 },
];

module.exports = {
  name: "search",
  aliases: ["sr"],
  description: "Search songs from multiple sources",
  category: "music",
  usage: "<query>",
  cooldown: 4,
  premium: false,
  ownerOnly: false,
  inVoice: true,
  sameVoice: true,
  needPlayer: false,

  async execute(client, message, args) {
    const query = args.join(" ");
    if (!query) return message.reply(cv2(`**Provide a search query!**`)).catch(() => { });

    const x = await message.reply(cv2(`**Searching please wait...**`)).catch(() => { });

    let player = client.lavalink.getPlayer(message.guild.id);
    if (!player) {
      player = await client.lavalink.createPlayer({
        guildId: message.guild.id,
        voiceChannelId: message.member.voice.channelId,
        textChannelId: message.channel.id,
        selfDeaf: true,
        volume: 80,
      });
    }
    if (!player.connected) await player.connect();

    const results = await Promise.allSettled(
      SOURCES.map(s =>
        player.search({ query, source: s.engine }, message.author)
          .then(r => ({ source: s, tracks: (r.tracks || []).slice(0, s.results) }))
          .catch(() => ({ source: s, tracks: [] }))
      )
    );

    const tracks = [];
    for (const res of results) {
      if (res.status !== "fulfilled") continue;
      const seen = new Set();
      for (const t of res.value.tracks) {
        const key = t.info?.identifier || t.info?.uri || t.info?.title;
        if (seen.has(key)) continue;
        seen.add(key);
        tracks.push({ ...t, _src: res.value.source });
      }
    }

    if (!tracks.length)
      return x?.edit(cv2(`<a:karma_wrong_time:1484885465944559616> **No results found for:** \`${query}\``)).catch(() => { });

    const final = tracks.slice(0, 25);

    const options = final.map((t, i) => ({
      label: `${t._src.emoji} ${(t.info.title || "Unknown").substring(0, 45)}`.substring(0, 100),
      value: `${i}`,
      description: `${t._src.label}  •  ${(t.info.author || "").substring(0, 25)}  •  ${t.info.isStream ? "LIVE" : client.formatTime(t.info.duration)}`.substring(0, 100),
    }));

    const menu = new StringSelectMenuBuilder()
      .setCustomId("flenzo_search")
      .setPlaceholder("Select tracks to add to queue...")
      .setMinValues(1)
      .setMaxValues(Math.min(final.length, 5))
      .addOptions(options);

    const srcSummary = SOURCES
      .map(s => {
        const count = final.filter(t => t._src.engine === s.engine).length;
        return count ? `${s.emoji} ${s.label} \`${count}\`` : null;
      })
      .filter(Boolean)
      .join("  •  ");

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Found \`${final.length}\` results** — select up to 5\n-# ${srcSummary}`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# flenzo Music — by Yadav`)
      );

    const m = await x?.edit({
      components: [container, new ActionRowBuilder().addComponents(menu)],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => { });

    if (!m) return;

    const collector = m.createMessageComponentCollector({
      filter: (i) => {
        if (i.user.id !== message.author.id) {
          i.reply({ content: "<a:karma_wrong_time:1484885465944559616> Not your search.", ephemeral: true }).catch(() => { });
          return false;
        }
        return true;
      },
      time: 60000,
    });

    collector.on("end", (col) => {
      if (!col.size) m.edit(cv2(`**Search timed out.**`)).catch(() => { });
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) interaction.deferUpdate().catch(() => { });
      await m.delete().catch(() => { });

      let desc = "";
      for (const val of interaction.values) {
        const song = final[Number(val)];
        await player.queue.add(song);
        const link = song.info?.uri?.startsWith("http") ? song.info.uri : client.support;
        desc += `<a:karma_TICK:1484879254306164826> ${song._src.emoji} **Added [${song.info.title.replace(/[\[\]]/g, "")}](${link})**\n`;
      }

      await message.reply({
        components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(desc.trim()))],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      }).catch(() => { });

      if (!player.playing && !player.paused) await player.play();
    });
  },
};

