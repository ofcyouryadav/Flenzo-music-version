/** @format - flenzo — NoPrefix Command */
const { cv2 } = require("../../utils/cv2");
const emoji = require("../../emoji");
const { hasNoPrefix, setNoPrefix, isPremium } = require("../../utils/premium");
const Guild = require("../../database/schemas/Guild");

module.exports = {
  name: "noprefix", aliases: ["np"],
  description: "Toggle noprefix for user or guild",
  category: "owner", cooldown: 0, premium: false, ownerOnly: false,

  async execute(client, message, args) {
    const sub = (args[0] || "").toLowerCase();

    // ── Guild noprefix (owner only) ───────────────────────────────────────
    if (sub === "guild") {
      if (!client.isOwner(message.author.id) && message.author.id !== message.guild.ownerId)
        return message.reply(cv2(`**Server owner or bot owner only.**`)).catch(() => { });

      const guildData = await Guild.findOne({ guildId: message.guild.id });
      const current = guildData?.noprefix || false;
      await Guild.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { noprefix: !current } },
        { upsert: true }
      );
      return message.reply(cv2(
        `**Guild NoPrefix:** \`${!current ? "Enabled" : "Disabled"}\`\n` +
        `-# ${!current ? "Anyone can now use commands without prefix!" : "Prefix is now required again."}`
      )).catch(() => { });
    }

    // ── User noprefix (owner grant) ───────────────────────────────────────
    if (sub === "add" || sub === "remove") {
      if (!client.isOwner(message.author.id))
        return message.reply(cv2(`${emoji.lock} **Bot owner only.**`)).catch(() => { });

      const target = message.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);
      if (!target) return message.reply(cv2(`${emoji.error} **Mention a user.**`)).catch(() => { });

      // Must be premium
      const hasPrem = await isPremium(target.id);
      if (!hasPrem && sub === "add")
        return message.reply(cv2(`${emoji.error} **${target.tag} must have premium first.**\n-# Use \`.premium add @user\` first.`)).catch(() => { });

      await setNoPrefix(target.id, sub === "add");
      return message.reply(cv2(
        `${sub === "add" ? emoji.success : emoji.error} **NoPrefix ${sub === "add" ? "granted to" : "removed from"} ${target.tag}**`
      )).catch(() => { });
    }

    // ── Self check ────────────────────────────────────────────────────────
    if (sub === "check" || !sub) {
      const target = message.mentions.users.first() || message.author;
      const has = await hasNoPrefix(target.id);
      const gData = await Guild.findOne({ guildId: message.guild.id });
      return message.reply(cv2(
        `**NoPrefix Status**\n` +
        `> **${target.tag}:** \`${has ? "Enabled" : "Disabled"}\`\n` +
        `> **This server:** \`${gData?.noprefix ? "Enabled" : "Disabled"}\``
      )).catch(() => { });
    }

    return message.reply(cv2(
      `**NoPrefix Command**\n\n` +
      `> \`.noprefix guild\` — Toggle for whole server *(server owner)*\n` +
      `> \`.noprefix add @user\` — Give user noprefix *(bot owner)*\n` +
      `> \`.noprefix remove @user\` — Remove *(bot owner)*\n` +
      `> \`.noprefix check [@user]\` — Check status`
    )).catch(() => { });
  },
};

