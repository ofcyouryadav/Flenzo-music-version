/** @format
 * flenzo Music Bot — Avatar Command
 * Developer: Yadav
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require("discord.js");

const { cv2 } = require("../../utils/cv2");

module.exports = {
  name: "avatar",
  aliases: ["av", "pfp"],
  description: "Show avatar of a user",
  category: "info",
  usage: "[@user / userID]",
  cooldown: 3,
  premium: false,
  ownerOnly: false,

  async execute(client, message, args) {
    const target =
      message.mentions.users.first() ||
      (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null) ||
      message.author;

    if (!target)
      return message.reply(cv2(`❌ **User not found.**`)).catch(() => {});

    // Avatar URLs — global + server
    const globalAvatar = target.displayAvatarURL({ size: 4096, dynamic: true });

    const member = message.guild
      ? await message.guild.members.fetch(target.id).catch(() => null)
      : null;

    const serverAvatar = member?.avatarURL({ size: 4096, dynamic: true });

    // Gallery items
    const gallery = new MediaGalleryBuilder();

    gallery.addItems(
      new MediaGalleryItemBuilder()
        .setURL(globalAvatar)
        .setDescription(`${target.username}'s Global Avatar`)
    );

    if (serverAvatar && serverAvatar !== globalAvatar) {
      gallery.addItems(
        new MediaGalleryItemBuilder()
          .setURL(serverAvatar)
          .setDescription(`${target.username}'s Server Avatar`)
      );
    }

    // Container
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `### 🖼️ ${target.username}'s Avatar`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addMediaGalleryComponents(gallery)
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          [
            `> 👤 **User:** ${target} (\`${target.id}\`)`,
            serverAvatar && serverAvatar !== globalAvatar
              ? `> 🌐 **Global:** [Link](${globalAvatar}) • 🏠 **Server:** [Link](${serverAvatar})`
              : `> 🌐 **Link:** [Click here](${globalAvatar})`,
          ]
            .filter(Boolean)
            .join("\n") +
            `\n-# ${serverAvatar && serverAvatar !== globalAvatar ? "2 avatars found" : "Global avatar"}`
        )
      );

    return message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => {});
  },
};
