/** @format
 * flenzo — Eval Command (Secure)
 * Developer: Yadav
 */

const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const emoji = require("../../emoji");

module.exports = {
  name: "eval", aliases: ["ev"],
  description: "Evaluate JavaScript (owner only)",
  category: "owner", cooldown: 0, premium: false, ownerOnly: true,

  async execute(client, message, args) {
    if (!client.isOwner(message.author.id)) return;

    const code = args.join(" ");
    if (!code) return message.reply({
      components: [new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.error} **Provide code to evaluate.**`)
      )],
      flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] },
    }).catch(() => {});

    const start = Date.now();
    let result, isError = false;

    try {
      // Try vm2 sandbox first
      let vm2Available = false;
      try { require.resolve("vm2"); vm2Available = true; } catch {}

      if (vm2Available) {
        const { VM } = require("vm2");
        const vm = new VM({
          timeout: 5000, allowAsync: true,
          sandbox: {
            client, message,
            guild:   message.guild,
            channel: message.channel,
            author:  message.author,
          },
        });
        result = await vm.run(`(async () => { ${code} })()`);
      } else {
        // Direct eval — owner-only so safe
        result = await eval(`(async () => { ${code} })()`);
      }
    } catch(e) {
      result = e.message;
      isError = true;
    }

    const elapsed = Date.now() - start;
    const type = typeof result;

    let output = (type === "object"
      ? JSON.stringify(result, null, 2)
      : String(result ?? "undefined")
    );

    // ── Token Protection ─────────────────────────────────────────────────────
    const secrets = [
      client.token,
      client.config.mongoUri,
      ...client.config.lavalink.nodes.map(n => n.authorization),
    ].filter(Boolean);

    for (const secret of secrets) {
      if (typeof secret !== "string" || secret.length < 5) continue;
      const escaped = secret.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      output = output.replace(new RegExp(escaped, "gi"), "[SECRET]");
    }

    output = output.slice(0, 1800);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        isError ? `**${emoji.error} Error**` : `**${emoji.success} Output**`
      ))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `\`\`\`js\n${output}\n\`\`\``
      ))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `-# Type: \`${type}\`  •  Time: \`${elapsed}ms\`  •  Lines: \`${code.split("\n").length}\``
      ));

    return message.reply({
      components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] },
    }).catch(() => {});
  },
};

