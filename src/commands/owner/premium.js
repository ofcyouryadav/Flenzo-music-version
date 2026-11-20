/** @format - flenzo — Premium Management */
const {
  ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder,
  SeparatorBuilder, SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { grantPremium, revokePremium, getPremiumInfo } = require("../../utils/premium");
const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "premium", aliases: ["prem"],
  description: "Manage premium users",
  category: "owner", cooldown: 0, premium: false, ownerOnly: true,

  async execute(client, message, args) {
    const sub  = (args[0] || "").toLowerCase();
    const user = message.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);

    if (!["add", "remove", "info"].includes(sub))
      return message.reply(cv2(
        `**Premium Management**\n\n` +
        `.premium add @user [days]\n` +
        `.premium remove @user\n` +
        `.premium info @user\n\n` +
        `-# No days = Lifetime`
      )).catch(() => {});

    if (!user)
      return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Mention a user or provide ID.**`)).catch(() => {});

    if (sub === "add") {
      const days = parseInt(args[2]) || null;
      await grantPremium(user.id, message.author.id, days);
      return message.reply(cv2(
        `<a:karma_TICK:1484879254306164826> **Premium granted to ${user.tag}**\n` +
        `Duration: \`${days ? `${days} days` : "Lifetime"}\``
      )).catch(() => {});
    }

    if (sub === "remove") {
      await revokePremium(user.id);
      return message.reply(cv2(`<a:karma_TICK:1484879254306164826> **Premium removed from ${user.tag}.**`)).catch(() => {});
    }

    if (sub === "info") {
      const info = await getPremiumInfo(user.id);
      if (!info || !info.isActive())
        return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **${user.tag} has no active premium.**`)).catch(() => {});

      const exp = info.expiresAt
        ? `<t:${Math.floor(info.expiresAt.getTime() / 1000)}:R>`
        : "Lifetime";

      const container = new ContainerBuilder()
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(
              `**Premium — ${user.tag}**\n` +
              `Expires: ${exp}\n` +
              `NoPrefix: \`${info.noprefix ? "Enabled" : "Disabled"}\`  •  Added by: <@${info.addedBy}>`
            ))
            .setThumbnailAccessory(new ThumbnailBuilder()
              .setURL(user.displayAvatarURL({ extension: "png" }))
              .setDescription("user"))
        );

      return message.reply({
        components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] },
      }).catch(() => {});
    }
  },
};
