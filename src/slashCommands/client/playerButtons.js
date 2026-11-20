/** @format
 * flenzo Music Bot — Player Button Handler
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const rebuildButtons = (player) => {
  const isPaused   = player.paused;
  const isAutoplay = player.get("autoplay") || false;
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("flenzo_previous").setLabel("⏮ Previous").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("flenzo_pause").setLabel(isPaused ? "▶ Resume" : "⏸ Pause").setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("flenzo_skip").setLabel("⏭ Skip").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("flenzo_autoplay").setLabel("🔁 Auto").setStyle(isAutoplay ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("flenzo_stop").setLabel("⏹ Stop").setStyle(ButtonStyle.Danger),
  );
};

const cv2Ephemeral = (text) => ({
  components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(text))],
  flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
  allowedMentions: { parse: [] },
});

module.exports = {
  name: "playerButtonClick",
  async execute(client, interaction) {
    if (!interaction.isButton()) return;
    const buttonIds = ["flenzo_previous", "flenzo_pause", "flenzo_skip", "flenzo_autoplay", "flenzo_stop"];
    if (!buttonIds.includes(interaction.customId)) return;

    if (!interaction.member?.voice?.channel)
      return interaction.reply(cv2Ephemeral("**Join a voice channel first!**"));

    const player = client.lavalink.getPlayer(interaction.guild.id);
    if (!player?.queue?.current)
      return interaction.reply(cv2Ephemeral("**Nothing is playing right now.**"));

    if (interaction.guild.members.me?.voice?.channelId !== interaction.member.voice.channelId)
      return interaction.reply(cv2Ephemeral(`**You must be in <#${interaction.guild.members.me.voice.channelId}> to use this.**`));

    const existing = interaction.message?.components ?? [];
    const nonButtons = existing.filter(c => c.type !== 1);

    try {
      await interaction.deferUpdate();
    } catch {
      return;
    }

    try {
      switch (interaction.customId) {

        case "flenzo_pause":
          await player.pause(!player.paused);
          client.voiceStatus?.updateForPause(player, player.paused).catch(() => {});
          break;

        case "flenzo_skip": {
          // ✅ Same fix as skip.js — check queue size before skipping
          const queueSize = player.queue.tracks.length;
          if (queueSize === 0 && !player.get("autoplay")) {
            return interaction.followUp(cv2Ephemeral("**No more songs in queue.**")).catch(() => {});
          }
          await player.skip().catch(() => {});
          break;
        }

        case "flenzo_previous": {
          const prev = player.queue.previous?.[0];
          if (!prev) {
            return interaction.followUp(cv2Ephemeral("**No previous track found.**")).catch(() => {});
          }
          await player.play({ track: prev });
          break;
        }

        case "flenzo_stop":
          if (player.queue.tracks.length > 0)
            await player.queue.splice(0, player.queue.tracks.length);
          player.set("autoplay", false);
          await player.stopPlaying(true, true);
          client.voiceStatus?.updateForEnd(player).catch(() => {});
          break;

        case "flenzo_autoplay": {
          const cur = player.get("autoplay") || false;
          player.set("autoplay", !cur);
          break;
        }
      }

      const newButtons = rebuildButtons(player);

      await interaction.message.edit({
        components: [...nonButtons, newButtons],
        allowedMentions: { parse: [] },
      }).catch(() => {});

    } catch (err) {
      await interaction.followUp(cv2Ephemeral("**An error occurred.**")).catch(() => {});
      console.error("Player button error:", err);
    }
  },
};