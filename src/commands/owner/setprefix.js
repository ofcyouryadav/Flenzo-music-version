const { cv2 } = require("../../utils/cv2");
const emoji = require("../../emoji");
const Guild = require("../../database/schemas/Guild");
module.exports = {
  name: "setprefix", aliases: ["prefix"],
  description: "Set server prefix",
  category: "owner", cooldown: 0, premium: false, ownerOnly: false,
  async execute(client, message, args) {
    if (!client.isOwner(message.author.id) && message.author.id !== message.guild.ownerId)
      return message.reply(cv2(`${emoji.lock} **Server owner or bot owner only.**`)).catch(() => {});
    const p = (args[0] || "").trim();
    if (!p || p.length > 5)
      return message.reply(cv2(`${emoji.error} **Provide a valid prefix (max 5 chars).**`)).catch(() => {});
    await Guild.findOneAndUpdate({ guildId: message.guild.id }, { $set: { prefix: p } }, { upsert: true });
    return message.reply(cv2(`${emoji.success} **Prefix changed to \`${p}\`**`)).catch(() => {});
  },
};

