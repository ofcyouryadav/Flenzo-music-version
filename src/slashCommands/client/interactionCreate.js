/** @format
 * flenzo Music Bot — Interaction Handler
 * Developer: Yadav
 */

const { isPremium } = require("../../utils/premium");
const { cv2 }       = require("../../utils/cv2");

const PLAYER_BTNS = ["flenzo_previous","flenzo_pause","flenzo_skip","flenzo_autoplay","flenzo_stop"];

module.exports = {
  name: "interactionCreate",
  async execute(client, interaction) {

    // ── Player buttons → emit to client ──────────────────────────────────────
    if (interaction.isButton() && PLAYER_BTNS.includes(interaction.customId)) {
      return client.emit("playerButtonClick", interaction);
    }

    // ── Slash commands ────────────────────────────────────────────────────────
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return;

    if (cmd.ownerOnly && !client.isOwner(interaction.user.id))
      return interaction.reply({ ...cv2(`**This command is owner only.**`), ephemeral: true });

    if (cmd.premium === true) {
      const hasPrem = await isPremium(interaction.user.id);
      if (!hasPrem && !client.isOwner(interaction.user.id))
        return interaction.reply({ ...cv2(`**This command requires Premium!**\n-# Join [Support](${client.support}) for more info.`), ephemeral: true });
    }

    if (cmd.inVoice && !interaction.member?.voice?.channel)
      return interaction.reply({ ...cv2(`**Join a voice channel first!**`), ephemeral: true });

    if (cmd.sameVoice) {
      const botVc = interaction.guild?.members.me?.voice?.channelId;
      if (botVc && botVc !== interaction.member?.voice?.channelId)
        return interaction.reply({ ...cv2(`**You must be in <#${botVc}>.**`), ephemeral: true });
    }

    if (cmd.needPlayer) {
      const player = client.lavalink.getPlayer(interaction.guild?.id);
      if (!player?.playing && !player?.paused)
        return interaction.reply({ ...cv2(`**Nothing is playing right now.**`), ephemeral: true });
    }

    try {
      await cmd.execute(client, interaction);
    } catch (err) {
      console.error(`[flenzo] Slash error [${interaction.commandName}]:`, err);
      const payload = { ...cv2(`**An error occurred.**`), ephemeral: true };
      interaction.replied || interaction.deferred
        ? interaction.followUp(payload).catch(() => {})
        : interaction.reply(payload).catch(() => {});
    }
  },
};
