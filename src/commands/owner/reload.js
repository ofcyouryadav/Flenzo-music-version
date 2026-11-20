/** @format
 * flenzo Music Bot — Reload Command
 * Developer: Yadav
 * Reloads commands/events without restart
 */

const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const cv2 = (text) => ({
  components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(text))],
  flags: MessageFlags.IsComponentsV2,
  allowedMentions: { parse: [] },
});

module.exports = {
  name: "reload",
  aliases: ["rl"],
  description: "Reload commands or events without restart",
  category: "owner",
  usage: "[commands|events|cmd <name>]",
  cooldown: 0,
  premium: false,
  ownerOnly: true,

  async execute(client, message, args) {
    const sub = (args[0] || "all").toLowerCase();

    // ── Reload single command ─────────────────────────────────────────────
    if (sub === "cmd" || sub === "command") {
      const cmdName = args[1]?.toLowerCase();
      if (!cmdName)
        return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Provide a command name.**\n-# Example: \`.reload cmd play\``)).catch(() => { });

      const cmdPath = path.join(__dirname, "../");
      let found = false;
      let filePath = null;

      // Find the file
      const cats = fs.readdirSync(cmdPath);
      for (const cat of cats) {
        const catPath = path.join(cmdPath, cat);
        if (!fs.statSync(catPath).isDirectory()) continue;
        const files = fs.readdirSync(catPath).filter(f => f.endsWith(".js"));
        for (const file of files) {
          const fp = path.join(catPath, file);
          const cmd = require(fp);
          if (cmd.name === cmdName || cmd.aliases?.includes(cmdName)) {
            filePath = fp; found = true; break;
          }
        }
        if (found) break;
      }

      if (!found)
        return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Command \`${cmdName}\` not found.**`)).catch(() => { });

      try {
        // Clear require cache
        delete require.cache[require.resolve(filePath)];
        const newCmd = require(filePath);

        // Remove old aliases
        for (const [key, val] of client.commands.entries()) {
          if (val.name === newCmd.name) client.commands.delete(key);
        }

        // Re-register
        client.commands.set(newCmd.name, newCmd);
        if (newCmd.aliases?.length) {
          for (const alias of newCmd.aliases) client.commands.set(alias, newCmd);
        }

        return message.reply(cv2(`<a:karma_TICK:1484879254306164826> **Reloaded command:** \`${newCmd.name}\``)).catch(() => { });
      } catch (err) {
        return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Error reloading \`${cmdName}\`:**\n\`\`\`js\n${err.message.slice(0, 500)}\n\`\`\``)).catch(() => { });
      }
    }

    // ── Reload all commands ───────────────────────────────────────────────
    if (sub === "commands" || sub === "cmds" || sub === "all") {
      const start = Date.now();
      const cmdPath = path.join(__dirname, "../");
      let loaded = 0, errors = [];

      // Clear all commands
      client.commands.clear();

      const cats = fs.readdirSync(cmdPath);
      for (const cat of cats) {
        const catPath = path.join(cmdPath, cat);
        if (!fs.statSync(catPath).isDirectory()) continue;
        const files = fs.readdirSync(catPath).filter(f => f.endsWith(".js"));
        for (const file of files) {
          const fp = path.join(catPath, file);
          try {
            delete require.cache[require.resolve(fp)];
            const cmd = require(fp);
            if (!cmd.name) continue;
            client.commands.set(cmd.name, cmd);
            if (cmd.aliases?.length) {
              for (const alias of cmd.aliases) client.commands.set(alias, cmd);
            }
            loaded++;
          } catch (err) {
            errors.push(`\`${file}\`: ${err.message.slice(0, 60)}`);
          }
        }
      }

      const elapsed = Date.now() - start;

      if (sub === "commands" || sub === "cmds") {
        const container = new ContainerBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Commands Reloaded**`))
          .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `> <a:karma_TICK:1484879254306164826> **Loaded:** \`${loaded} commands\`\n` +
            `> **Time:** \`${elapsed}ms\`\n` +
            (errors.length ? `>**Errors (${errors.length}):**\n${errors.slice(0, 5).map(e => `> ${e}`).join("\n")}` : `>**No errors**`)
          ));
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } }).catch(() => { });
      }

      // If "all" — also reload events below
      if (sub !== "all") return;

      // ── Reload events ────────────────────────────────────────────────────
      let evLoaded = 0, evErrors = [];
      const eventsPath = path.join(__dirname, "../../events");

      // Remove all existing listeners (except internal ones)
      client.removeAllListeners();
      // Re-add raw for lavalink
      client.on("raw", (data) => client.lavalink?.sendRawData(data));

      const folders = fs.readdirSync(eventsPath);
      for (const folder of folders) {
        const folderPath = path.join(eventsPath, folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;
        const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));
        for (const file of files) {
          const fp = path.join(folderPath, file);
          try {
            delete require.cache[require.resolve(fp)];
            const event = require(fp);
            if (!event.name) continue;

            if (folder === "lavalink") {
              // Can't easily remove lavalink listeners, skip
              evLoaded++;
              continue;
            }

            if (event.once) {
              client.once(event.name, (...a) => event.execute(client, ...a));
            } else {
              client.on(event.name, (...a) => event.execute(client, ...a));
            }
            evLoaded++;
          } catch (err) {
            evErrors.push(`\`${file}\`: ${err.message.slice(0, 60)}`);
          }
        }
      }

      const totalTime = Date.now() - start;
      const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Full Reload Complete**`))
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
          `> **Commands:** \`${loaded}\` loaded\n` +
          `> **Events:** \`${evLoaded}\` loaded\n` +
          `> **Time:** \`${totalTime}ms\`\n` +
          (errors.length || evErrors.length
            ? `> <a:karma_wrong_time:1484885465944559616> **Errors:** \`${errors.length + evErrors.length}\``
            : `> <a:karma_TICK:1484879254306164826> **No errors**`)
        ));
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } }).catch(() => { });
    }

    // ── Usage ─────────────────────────────────────────────────────────────
    return message.reply(cv2(
      `**Reload Command**\n\n` +
      `> \`.reload all\` — Reload commands + events\n` +
      `> \`.reload commands\` — Reload all commands only\n` +
      `> \`.reload cmd <name>\` — Reload specific command\n\n` +
      `-# Lavalink events require restart to reload`
    )).catch(() => { });
  },
};

