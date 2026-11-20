/** @format
 * flenzo Music Bot — Vote Command
 * Developer: Yadav
 */

const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, MessageFlags, MediaGalleryBuilder, MediaGalleryItemBuilder,
} = require("discord.js");

const Premium = require("../../database/schemas/Premium");

const BOT_ID    = "998547879201349693";
const VOTE_URL  = `https://top.gg/bot/${BOT_ID}/vote`;
const TOPGG_URL = `https://top.gg/bot/${BOT_ID}`;

module.exports = {
  name: "vote",
  aliases: ["upvote", "topgg"],
  description: "Vote for flenzo on top.gg",
  category: "general",
  usage: "",
  cooldown: 5,
  premium: false,
  ownerOnly: false,

  async execute(client, message) {

    // Premium status check
    const premiumData = await Premium.findOne({ userId: message.author.id });
    const isPremium   = premiumData?.isActive?.() ?? false;

    // Guild stats
    const totalServers = client.guilds.cache.size;
    const totalUsers   = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    const totalPlayers = client.lavalink?.players?.size ?? 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Vote on top.gg")
        .setEmoji("🗳️")
        .setStyle(ButtonStyle.Link)
        .setURL(VOTE_URL),
      new ButtonBuilder()
        .setLabel("View Profile")
        .setEmoji("🔗")
        .setStyle(ButtonStyle.Link)
        .setURL(TOPGG_URL),
    );

    const container = new ContainerBuilder()
      // Header
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `### 🗳️ Vote for flenzo`
      ))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))

      // Vote perks
      .addTextDisplayComponents(new TextDisplayBuilder().setContent([
        `> 💜 **Support flenzo** by voting every **12 hours** on top.gg!`,
        `> Your vote helps flenzo reach more music lovers.`,
      ].join("\n")))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))

      // Rewards section
      .addTextDisplayComponents(new TextDisplayBuilder().setContent([
        `**🎁 Vote Rewards**`,
        ``,
        `> ✨ **2x XP** boost for 12 hours`,
        `> 🎵 **Unlock filters** — bassboost, nightcore & more`,
        `> 🏆 **Voter role** in our support server`,
        `> ⭐ **Priority queue** — skip the line`,
        `> 💎 **Exclusive badge** on your profile`,
      ].join("\n")))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))

      // Bot stats
      .addTextDisplayComponents(new TextDisplayBuilder().setContent([
        `**📊 flenzo Stats**`,
        ``,
        `> 🏠 **Servers:** \`${totalServers.toLocaleString()}\``,
        `> 👥 **Users:** \`${totalUsers.toLocaleString()}\``,
        `> 🎶 **Active players:** \`${totalPlayers}\``,
        `> ⭐ **Premium status:** ${isPremium ? `\`Active ✅\`` : `\`Inactive ❌\``}`,
      ].join("\n")))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))

      // How to vote
      .addTextDisplayComponents(new TextDisplayBuilder().setContent([
        `**📋 How to Vote**`,
        ``,
        `> **1.** Click **"Vote on top.gg"** below`,
        `> **2.** Log in with your Discord account`,
        `> **3.** Click the vote button on the page`,
        `> **4.** Come back after **12 hours** to vote again!`,
      ].join("\n")))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))

      // Footer
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `-# Every vote means a lot — thank you for supporting flenzo! 💜`
      ))

      // Buttons
      .addActionRowComponents(row);

    return message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => {});
  },
};