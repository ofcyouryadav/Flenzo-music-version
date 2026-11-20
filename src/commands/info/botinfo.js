/** @format
 * flenzo Music Bot — Bot Info Command
 * Developer: Yadav
 */

const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, SectionBuilder, ThumbnailBuilder,
  MediaGalleryBuilder, MediaGalleryItemBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,
} = require("discord.js");

// ── Team ──────────────────────────────────────────────────────────────────────
const TEAM = {
  owner1:   { name: "Alone",    id: "1363724949939814423", role: "<:karma_owner:1484875636446203914> Owner",            desc: "Founder & owner of flenzo Music" },
  leadDev:  { name: "Yadav",    id: "867420007558021141",  role: "<a:karam_music_dev:1484875326549917706> Lead Developer", desc: "Builds & maintains the entire bot" },
  lavalink: { name: "Producer", id: "977229749539713116",  role: "<:lavalink:1484875687666909245> Lavalink Manager",    desc: "Manages Lavalink nodes & audio infrastructure" },
};

// ── Footer ────────────────────────────────────────────────────────────────────
const FOOTER = `-# Crafted by Yadav`;

// ── Nav buttons ───────────────────────────────────────────────────────────────
const navRow = (active) => new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId("bi_home").setLabel("Home").setStyle(active === "home" ? ButtonStyle.Primary : ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId("bi_dev").setLabel("Dev").setStyle(active === "dev" ? ButtonStyle.Primary : ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId("bi_hosting").setLabel("Hosting").setStyle(active === "hosting" ? ButtonStyle.Primary : ButtonStyle.Secondary),
  new ButtonBuilder().setLabel("Support").setStyle(ButtonStyle.Link).setURL("https://discord.gg/mjeuyd2Xht"),
  new ButtonBuilder().setCustomId("bi_close").setLabel("✕").setStyle(ButtonStyle.Danger),
);

// ── Fetch user profile from Discord API ───────────────────────────────────────
async function fetchProfile(client, userId) {
  try {
    const user = await client.users.fetch(userId, { force: true });
    const avatarURL = user.displayAvatarURL({ extension: user.avatar?.startsWith("a_") ? "gif" : "png", size: 512 });
    const bannerURL = user.banner
      ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith("a_") ? "gif" : "png"}?size=1024`
      : null;
    const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`;

    const flagsMap = {
      Staff: "Discord Staff",
      Partner: "Partnered Server Owner",
      Hypesquad: "HypeSquad Events",
      BugHunterLevel1: "Bug Hunter",
      HypeSquadOnlineHouse1: "House Bravery",
      HypeSquadOnlineHouse2: "House Brilliance",
      HypeSquadOnlineHouse3: "House Balance",
      PremiumEarlySupporter: "Early Supporter",
      BugHunterLevel2: "Bug Hunter Gold",
      VerifiedBotDeveloper: "Early Verified Bot Dev",
      ActiveDeveloper: "Active Developer",
      CertifiedModerator: "Certified Moderator",
    };

    const flags = user.flags?.toArray() || [];
    const badges = flags.map(f => flagsMap[f]).filter(Boolean);
    if (user.discriminator !== "0") badges.unshift("💎 Nitro");

    return { user, avatarURL, bannerURL, createdAt, badges };
  } catch {
    return null;
  }
}

// ── Pages ─────────────────────────────────────────────────────────────────────

const homePage = (client, bannerURL) => {
  const guilds = client.guilds.cache.size;
  const users = client.guilds.cache.reduce((a, g) => a + (g.memberCount || 0), 0);
  const ping = client.ws.ping;
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600), m = Math.floor((uptime % 3600) / 60);

  const c = new ContainerBuilder();

  if (bannerURL) {
    c.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(bannerURL).setDescription("Flenzo Bot Banner")
      )
    );
  } else {
    c.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**<:karma_music:1484878900155908228> flenzo Music**`))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(client.user.displayAvatarURL({ extension: "png", size: 512 })).setDescription("Flenzo"))
    );
  }

  return c
    .addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Flenzo** is a high quality Discord Music Bot powered by **Lavalink**, delivering crystal-clear audio straight to your server. ` +
      `Supporting **Spotify**, **YouTube**, **Deezer**, **SoundCloud** & **Apple Music** — your entire music world in one bot. ` +
      `Packed with premium features, smart autoplay, audio filters, canvas music cards and a seamless listening experience.`
    ))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Statistics**\n` +
      `Servers: \`${guilds}\`  •  Users: \`${users.toLocaleString()}\`  •  Ping: \`${ping}ms\`\n` +
      `Uptime: \`${h}h ${m}m\`  •  Prefix: \`${client.prefix || "."}\``
    ))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(FOOTER))
    .addActionRowComponents(navRow("home"));
};

const devPage = () =>
  new ContainerBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Meet The Team**\n-# The people behind flenzo Music`))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    // Owner
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**${TEAM.owner1.role}**\n${TEAM.owner1.name}\n-# ${TEAM.owner1.desc}`
    ))
    .addActionRowComponents(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("bi_profile_owner1").setLabel(`View ${TEAM.owner1.name}`).setStyle(ButtonStyle.Secondary),
    ))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small))
    // Lead Dev
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**${TEAM.leadDev.role}**\n${TEAM.leadDev.name}\n-# ${TEAM.leadDev.desc}`
    ))
    .addActionRowComponents(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("bi_profile_leadDev").setLabel(`View ${TEAM.leadDev.name}`).setStyle(ButtonStyle.Secondary),
    ))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small))
    // Lavalink
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**${TEAM.lavalink.role}**\n${TEAM.lavalink.name}\n-# ${TEAM.lavalink.desc}`
    ))
    .addActionRowComponents(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("bi_profile_lavalink").setLabel(`View ${TEAM.lavalink.name}`).setStyle(ButtonStyle.Secondary),
    ))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(FOOTER))
    .addActionRowComponents(navRow("dev"));

const profilePage = (member, profile) => {
  const c = new ContainerBuilder();

  if (profile.bannerURL) {
    c.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(profile.bannerURL).setDescription(`${member.name}'s banner`)
      )
    );
  }

  c.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `**${member.role}**\n### ${profile.user.username}\n-# ${profile.user.displayName !== profile.user.username ? `Display: ${profile.user.displayName}` : member.desc}`
      ))
      .setThumbnailAccessory(
        new ThumbnailBuilder().setURL(profile.avatarURL).setDescription(`${member.name}'s avatar`)
      )
  )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Info**\n` +
      `Username: \`${profile.user.username}\`  •  ID: \`${profile.user.id}\`\n` +
      `Created: ${profile.createdAt}\n` +
      (profile.badges.length ? `Badges: ${profile.badges.join(", ")}` : `Badges: \`None\``)
    ))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(FOOTER))
    .addActionRowComponents(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("bi_dev").setLabel("← Back").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setLabel("Support").setStyle(ButtonStyle.Link).setURL("https://discord.gg/mjeuyd2Xht"),
      new ButtonBuilder().setCustomId("bi_close").setLabel("✕").setStyle(ButtonStyle.Danger),
    ));

  return c;
};

const hostingPage = () =>
  new ContainerBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**🌐 Hosting — HidenCloud**`))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**[HidenCloud](https://hidencloud.com)** is a powerful and affordable hosting platform trusted by thousands of Discord bot developers. ` +
      `Starting from just **€1.99/month**, it offers rock-solid 99.9% uptime, instant deployment and everything you need to keep your bot running 24/7.`
    ))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**flenzo's Setup**\n` +
      `Provider: [HidenCloud](https://hidencloud.com)  •  Runtime: \`Node.js\`\n` +
      `Database: \`MongoDB\`  •  Audio: \`Lavalink\`  •  Uptime: \`24/7\``
    ))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**HidenCloud Features**\n` +
      `<a:karma_TICK:1484879254306164826> Plans starting from **€1.99/mo**\n` +
      `<a:karma_TICK:1484879254306164826> **Free tier** — 2 vCPU, 3GB RAM, 15GB NVMe\n` +
      `<a:karma_TICK:1484879254306164826> Node.js, Python, Java & more\n` +
      `<a:karma_TICK:1484879254306164826> MySQL, PostgreSQL, MongoDB & Redis\n` +
      `<a:karma_TICK:1484879254306164826> Easy file manager — no terminal needed\n` +
      `<a:karma_TICK:1484879254306164826> 99.9% uptime with auto-restart\n` +
      `<a:karma_TICK:1484879254306164826> Lavalink hosting support\n` +
      `<a:karma_TICK:1484879254306164826> Active Discord support — 20,000+ members\n` +
      `🌐 [hidencloud.com](https://hidencloud.com)`
    ))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(FOOTER))
    .addActionRowComponents(navRow("hosting"));

// ── Command ───────────────────────────────────────────────────────────────────
module.exports = {
  name: "botinfo",
  aliases: ["about", "bi"],
  description: "Show information about flenzo Music Bot",
  category: "info",
  cooldown: 5,
  premium: false,
  ownerOnly: false,
  inVoice: false,
  sameVoice: false,
  needPlayer: false,

  async execute(client, message) {
    let bannerURL = null;
    try {
      const botUser = await client.users.fetch(client.user.id, { force: true });
      if (botUser.banner) {
        const ext = botUser.banner.startsWith("a_") ? "gif" : "png";
        bannerURL = `https://cdn.discordapp.com/banners/${client.user.id}/${botUser.banner}.${ext}?size=1024`;
      }
    } catch { }

    const sent = await message.reply({
      components: [homePage(client, bannerURL)],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => { });

    if (!sent) return;

    const collector = sent.createMessageComponentCollector({
      filter: (i) => {
        if (i.user.id !== message.author.id) {
          i.reply({ content: "<a:karma_wrong_time:1484885465944559616> Not your menu.", ephemeral: true }).catch(() => { });
          return false;
        }
        return true;
      },
      time: 120000,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate().catch(() => { });

      if (i.customId === "bi_close") {
        collector.stop("closed");
        return sent.edit({
          components: [new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`<a:karma_TICK:1484879254306164826> **Closed.**\n${FOOTER}`))
          ],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] },
        }).catch(() => { });
      }

      if (i.customId === "bi_home") {
        return sent.edit({ components: [homePage(client, bannerURL)], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } }).catch(() => { });
      }
      if (i.customId === "bi_dev") {
        return sent.edit({ components: [devPage()], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } }).catch(() => { });
      }
      if (i.customId === "bi_hosting") {
        return sent.edit({ components: [hostingPage()], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } }).catch(() => { });
      }

      const profileMap = {
        bi_profile_owner1:  TEAM.owner1,
        bi_profile_leadDev: TEAM.leadDev,
        bi_profile_lavalink: TEAM.lavalink,
      };

      const member = profileMap[i.customId];
      if (member) {
        await sent.edit({
          components: [new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Fetching ${member.name}'s profile...**`))
          ],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] },
        }).catch(() => { });

        const profile = await fetchProfile(client, member.id);

        if (!profile) {
          return sent.edit({
            components: [devPage()],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { parse: [] },
          }).catch(() => { });
        }

        return sent.edit({
          components: [profilePage(member, profile)],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] },
        }).catch(() => { });
      }
    });

    collector.on("end", (_, reason) => {
      if (reason === "closed") return;
      sent.edit({
        components: [new ContainerBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Timed out.**\n${FOOTER}`))
        ],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      }).catch(() => { });
    });
  },
};
