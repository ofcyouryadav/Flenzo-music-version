/** @format
 * flenzo Music Bot — Ping Command
 * Developer: Yadav
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "ping",
  aliases: ["pong"],
  description: "Check bot latency",
  category: "info",
  usage: "",
  cooldown: 5,
  premium: false,
  ownerOnly: false,
  inVoice: false,
  sameVoice: false,
  needPlayer: false,

  async execute(client, message) {
    const sent = await message.reply({
      components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("**Pinging...**"))],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => {});

    const msgLatency = sent ? Date.now() - message.createdTimestamp : 0;
    const wsLatency = client.ws.ping;

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Pong!**`)
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `WebSocket: \`${wsLatency}ms\`\n` +
          `Message Latency: \`${msgLatency}ms\``
        )
      );

    sent?.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => {});
  },
};

