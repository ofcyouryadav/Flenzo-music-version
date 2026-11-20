/** @format
 * flenzo Music Bot — CV2 Helpers
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

// Simple text container
const cv2 = (text) => ({
  components: [
    new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(text)
    ),
  ],
  flags: MessageFlags.IsComponentsV2,
  allowedMentions: { parse: [] },
});

// Container with separator
const cv2Sep = (text) => ({
  components: [
    new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(text))
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small)
      ),
  ],
  flags: MessageFlags.IsComponentsV2,
  allowedMentions: { parse: [] },
});

// Build a container object (not wrapped in payload) for composing
const buildContainer = () => new ContainerBuilder();

module.exports = {
  cv2,
  cv2Sep,
  buildContainer,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  TextDisplayBuilder,
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
};

