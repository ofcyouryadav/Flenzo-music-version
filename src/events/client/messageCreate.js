/** @format
 * flenzo Music Bot — Message Handler
 * Developer: Yadav
 * Supports: prefix, mention, noprefix (user + guild)
 */

const { isPremium, hasNoPrefix } = require("../../utils/premium");
const { cv2 } = require("../../utils/cv2");
const Guild = require("../../database/schemas/Guild");

// Guild config cache (30s)
const guildCache = new Map();
const getGuildData = async (guildId) => {
  if (guildCache.has(guildId)) {
    const { data, exp } = guildCache.get(guildId);
    if (Date.now() < exp) return data;
  }
  let data = await Guild.findOne({ guildId }).catch(() => null);
  if (!data) data = await Guild.create({ guildId }).catch(() => null);
  guildCache.set(guildId, { data, exp: Date.now() + 30000 });
  return data;
};

module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    if (message.author.bot || !message.guild) return;

    // ── Blacklist check ───────────────────────────────────────────────────
    if (client.blacklist?.has(message.author.id)) return;

    const guildData = await getGuildData(message.guild.id);
    const guildPrefix = guildData?.prefix || client.prefix;
    const mentionRegex = new RegExp(`^<@!?${client.user.id}>( |$)`);
    const content = message.content;

    let usedPrefix = null;
    let isMention = false;

    if (content.startsWith(guildPrefix)) {
      usedPrefix = guildPrefix;
    } else if (mentionRegex.test(content)) {
      usedPrefix = content.match(mentionRegex)[0];
      isMention = true;
    } else {
      // ── Noprefix check (user-level premium OR guild-wide) ─────────────────
      const userNP = await hasNoPrefix(message.author.id);
      const guildNP = guildData?.noprefix === true;
      if (userNP || guildNP) {
        usedPrefix = ""; // no prefix needed
      } else {
        return;
      }
    }

    // ── Mention with no command → show prefix ─────────────────────────────
    if (isMention) {
      const afterMention = content.slice(usedPrefix.length).trim();
      if (!afterMention) {
        const { ContainerBuilder, TextDisplayBuilder, ThumbnailBuilder, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");
        return message.reply({
          components: [new ContainerBuilder()
            .addSectionComponents(
              new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                  `**Hey ${message.author.username}!**\n` +
                  `I'm **flenzo**, your advanced music bot!\n` +
                  `Prefix: \`${guildPrefix}\`\n\n` +
                  `-# Try \`${guildPrefix}play <song>\` or \`${guildPrefix}help\``
                ))
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(client.user.displayAvatarURL({ extension: "png" })).setDescription("flenzo"))
            )
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(
              `-# [Support](${client.support})  •  flenzo Music by Yadav`
            ))
          ],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] },
        }).catch(() => { });
      }
    }

    const args = content.slice(usedPrefix.length).trim().split(/\s+/);
    const cmdName = args.shift().toLowerCase();
    if (!cmdName) return;

    const cmd = client.commands.get(cmdName);
    if (!cmd) return;

    // ── Owner only ────────────────────────────────────────────────────────
    if (cmd.ownerOnly && !client.isOwner(message.author.id))
      return message.reply(cv2(`**Owner only command.**`)).catch(() => { });

    // ── Premium check ─────────────────────────────────────────────────────
    if (cmd.premium === true && !client.isOwner(message.author.id)) {
      const hasPrem = await isPremium(message.author.id);
      if (!hasPrem)
        return message.reply(cv2(
          `**Premium Required!**\n` +
          `This command is for premium users only.\n` +
          `Join [Support](${client.support}) to get premium.`
        )).catch(() => { });
    }

    // ── Cooldown ──────────────────────────────────────────────────────────
    if (cmd.cooldown) {
      const key = `${cmd.name}-${message.author.id}`;
      const now = Date.now();
      const cd = Number(cmd.cooldown) * 1000;
      const last = client.cooldowns.get(key) || 0;
      if (now - last < cd) {
        const rem = ((cd - (now - last)) / 1000).toFixed(1);
        return message.reply(cv2(`**Cooldown!** Wait \`${rem}s\``)).catch(() => { });
      }
      client.cooldowns.set(key, now);
      setTimeout(() => client.cooldowns.delete(key), cd);
    }

    // ── Voice checks ──────────────────────────────────────────────────────
    if (cmd.inVoice && !message.member?.voice?.channel)
      return message.reply(cv2(`**Join a voice channel first!**`)).catch(() => { });

    if (cmd.sameVoice) {
      const botVc = message.guild.members.me?.voice?.channelId;
      if (botVc && botVc !== message.member?.voice?.channelId)
        return message.reply(cv2(`**You must be in <#${botVc}>.**`)).catch(() => { });
    }

    if (cmd.needPlayer) {
      const player = client.lavalink.getPlayer(message.guild.id);
      if (!player?.playing && !player?.paused)
        return message.reply(cv2(`**Nothing is playing right now.**`)).catch(() => { });
    }

    // ── Execute ───────────────────────────────────────────────────────────
    try {
      await cmd.execute(client, message, args);
    } catch (err) {
      console.error(`[flenzo] Command error [${cmd.name}]:`, err);
      message.reply(cv2(`**An error occurred.**`)).catch(() => { });
    }
  },
};

