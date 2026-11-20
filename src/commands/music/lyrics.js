/** @format - flenzo — Lyrics (Premium) */
const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, MessageFlags,
} = require("discord.js");
const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "lyrics", aliases: ["ly"],
  description: "Get lyrics of current/any song",
  category: "music", cooldown: 10, premium: true,
  inVoice: false, sameVoice: false, needPlayer: false,

  async execute(client, message, args) {
    let query = args.join(" ");

    if (!query) {
      const player = client.lavalink.getPlayer(message.guild.id);
      if (!player?.queue?.current)
        return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Provide a song name or play something first.**`)).catch(() => { });
      query = `${player.queue.current.info.title} ${player.queue.current.info.author}`;
    }

    const x = await message.reply(cv2(`**Fetching lyrics for:** \`${query}\`...`)).catch(() => { });

    try {
      const axios = require("axios");
      const search = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`, { timeout: 8000 });
      const data = search.data;

      if (!data?.lyrics) return x?.edit(cv2(`<a:karma_wrong_time:1484885465944559616> **No lyrics found for:** \`${query}\``)).catch(() => { });

      const lyrics = data.lyrics.length > 3000 ? data.lyrics.slice(0, 3000) + "\n..." : data.lyrics;
      const chunks = lyrics.match(/.{1,900}/gs) || [lyrics];

      const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
          `**🎵 ${data.title || query}**\n-# ${data.author || ""}`
        ))
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

      for (const chunk of chunks.slice(0, 3)) {
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(chunk));
      }

      container
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Premium feature  •  flenzo Music by Yadav`));

      return x?.edit({
        components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] },
      }).catch(() => { });
    } catch {
      return x?.edit(cv2(`<a:karma_wrong_time:1484885465944559616> **Failed to fetch lyrics. Try again.**`)).catch(() => { });
    }
  },
};

